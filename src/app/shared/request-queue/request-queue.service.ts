import {Injectable, NgZone} from '@angular/core';
import {HttpClient, HttpEvent, HttpEventType, HttpHeaders, HttpRequest} from '@angular/common/http';
import {RequestQueueEntry} from './request-queue-entry';
import {RequestQueueStateEnum} from './request-queue-state.enum';
import {toJsonBlob} from '../net-utils';
import {Observable} from 'rxjs/Observable';
import {RequestQueueEntryState} from './request-queue-entry-state';
import {RequestTypeEnum} from './request-type.enum';
import {AuthService} from '../auth/auth.service';

@Injectable()
export class RequestQueueService {

  private INDEXEDDB_STORE_VERSION = 1;
  private INITIAL_DELAY_TO_START_QUEUE = 50;
  private RETRY_DELAY_WHEN_OFFLINE = 10000;
  private REQUEST_OVERHEAD_BYTES = 1000;
  private DB_NAME = 'requestQueue';
  private TABLE_NAME = 'requests';
  private PRIMARY_KEY = 'queueId';
  private ALLOWED_HTTP_METHODS = ['PUT', 'POST', 'DELETE'];

  private DEBUG_QUEUE_PROCESSING_ENABLED = true; // should be set to true

  private db: IDBDatabase;
  private isDBReady = false;
  private callBackMap = {};

  private queueState = RequestQueueStateEnum.QUEUED;

  private isClientOffline = false;
  private isQueueProcessingActive = false;
  private entryCount = 0;
  private queueSize = 0;
  private currentRequestId: number = null;
  private currentRequestBytes = 0;
  private currentRequestProcessedBytes = 0;
  private queueEntryStates: RequestQueueEntryState[] = [];

  constructor(private http: HttpClient,
              private authService: AuthService,
              private ngZone: NgZone) {
    this.initDB();
  }

  /**
   * call this on app-start/login to start processing pending uploads
   * if this isn't done, processing starts with the next pushed queueItem
   */
  initQueueWorker(): void {
    setTimeout(() => {
      this.calcCurrentQueueSize();
      this.processQueueIfNecessary();
    }, this.INITIAL_DELAY_TO_START_QUEUE);
  }

  // registers a callback method which will be called from requestQueueService with the params
  // RequestQueueEntry, httpResponseCode, responseBody
  registerCallBackMethod(methodAlias: string,
                         method: Function): void {
    this.callBackMap[methodAlias] = method;
  }

  getRequestQueueState(): RequestQueueStateEnum {
    return this.queueState;
  }

  getQueuedRequestCount(): number {
    return this.entryCount;
  }

  getQueuedRequestBytes(): number {
    return this.queueSize;
  }

  getCurrentRequestId(): number {
    return this.currentRequestId;
  }

  getCurrentRequestBytes(): number {
    return this.currentRequestBytes;
  }

  getCurrentProgressPercent(): number {
    let percent = 0;
    if (this.currentRequestId && this.currentRequestBytes && this.currentRequestBytes > 0 &&
      this.currentRequestProcessedBytes && this.currentRequestProcessedBytes > 0) {
      percent = Math.floor(this.currentRequestProcessedBytes / this.currentRequestBytes * 100);
    }
    // don't show 100% because in that case the HttpClient has uploaded all data and wait's for response
    if (percent === 100) {
      percent = 99;
    }
    return percent;
  }

  // queues a PUT/POST/DELETE request, the returned queueId can be used to fetch a state object with getRequestState(id)
  queueJsonRequest(requestType: RequestTypeEnum,
                   requestUrl: string,
                   httpMethod: string,
                   jsonData: any,
                   successCallback: string,
                   errorCallback: string): Observable<number> {
    let payloadSize = 0;
    if (jsonData) {
      payloadSize += JSON.stringify(jsonData).length;
    }
    return this.queueRequest(requestType, requestUrl, httpMethod, jsonData, null, null, payloadSize,
      successCallback, errorCallback);
  }

  // queues a PUT/POST/DELETE request, the returned queueId can be used to fetch a state object with getRequestState(id)
  queueMultipartRequest(requestType: RequestTypeEnum,
                        requestUrl: string,
                        httpMethod: string,
                        jsonData: any,
                        content: any,
                        thumbnail: any,
                        successCallback: string,
                        errorCallback: string): Observable<number> {
    let payloadSize = 0;
    if (jsonData) {
      payloadSize += JSON.stringify(jsonData).length;
    }
    if (content) {
      payloadSize += content.size;
    }
    if (thumbnail) {
      payloadSize += thumbnail.size;
    }
    return this.queueRequest(requestType, requestUrl, httpMethod, jsonData, content, thumbnail, payloadSize,
      successCallback, errorCallback);
  }

  clearQueue(): void {
    this.getDatabase().subscribe(
      (db) => {
        const transaction = db.transaction([this.TABLE_NAME], 'readwrite');
        transaction.onerror = (error) => {
          console.error('indexedDB transaction error during clearQueue', error);
        };
        transaction.oncomplete = () => {
          this.isQueueProcessingActive = false;
          this.updateCurrentUploadedSize(0);
          this.calcCurrentQueueSize();
          this.processQueueIfNecessary();
        };

        const addRequest = transaction.objectStore(this.TABLE_NAME).clear();
        addRequest.onerror = (error) => {
          console.error('indexedDB transaction error during clearQueue', error);
        };

      },
      (error) => {
        console.error('processQueueIfNecessary failed', error);
      });
  }

  // the returned RequestQueueEntryStateDTO object will be updated automatically via angular data binding
  getRequestState(queueId: number): RequestQueueEntryState {
    const state = this.queueEntryStates[queueId];
    if (state) {
      return state;
    } else {
      return null;
    }
  }

  getQueuedRequests(requestType: RequestTypeEnum): Observable<RequestQueueEntry[]> {
    return new Observable<RequestQueueEntry[]>(observer => {
      this.getDatabase().subscribe(
        (db) => {
          const transaction = db.transaction([this.TABLE_NAME], 'readonly');
          transaction.onerror = (error) => {
            console.error('indexedDB transaction error during getQueuedRequests', error);
          };

          const requests: RequestQueueEntry[] = [];
          const openCursorRequest: IDBRequest = transaction.objectStore(this.TABLE_NAME).openCursor();
          openCursorRequest.onsuccess = (event) => {
            const cursor: IDBCursorWithValue = (<IDBRequest> event.target).result;
            if (cursor) {
              if (this.isOwnCursor(cursor) &&
                (cursor.value.requestType === requestType || requestType === null)) {
                const request: RequestQueueEntry = cursor.value;
                request.binaryData = new Blob([cursor.value.binaryData]);
                request.thumbnail = new Blob([cursor.value.thumbnail]);
                requests.push(cursor.value);
              }
              cursor.continue();
            } else {
              // end of table reached
              observer.next(requests);
              observer.complete();
            }
          };
          openCursorRequest.onerror = (error) => {
            console.error('indexedDB transaction error during getQueuedRequests', error);
            observer.error(error);
          };
        },
        (error) => {
          console.error('processQueueIfNecessary failed', error);
        });
    });
  }

  /* private methods */

  private initDB(): void {
    const request: IDBOpenDBRequest = indexedDB.open(this.DB_NAME, this.INDEXEDDB_STORE_VERSION);
    request.onsuccess = () => {
      this.db = request.result;
      setTimeout(() => {
        this.isDBReady = true;
      }, 500);
    };
    request.onupgradeneeded = () => {
      this.db = request.result;
      this.db.createObjectStore(this.TABLE_NAME, {keyPath: this.PRIMARY_KEY, autoIncrement: true});
      setTimeout(() => {
        this.isDBReady = true;
      }, 500);
    };
    request.onerror = (error) => {
      console.error('open indexedDB failed', error);
    };
  }

  private getDatabase(): Observable<IDBDatabase> {
    return new Observable<IDBDatabase>((observer) => {
      let timer = 0;
      const waitForDB = setInterval(() => {
        if (this.isDBReady) {
          observer.next(this.db);
          observer.complete();
          clearInterval(waitForDB);
        } else {
          timer += 1;
          if (timer > 50) {
            observer.error('could not access indexedDB');
            clearInterval(waitForDB);
          }
        }
      }, 100);
    });
  }

  private queueRequest(requestType: RequestTypeEnum,
                       requestUrl: string,
                       httpMethod: string,
                       jsonData: any,
                       binaryData: any,
                       thumbnail: any,
                       payloadBytes: number,
                       successCallback: string,
                       errorCallback: string): Observable<number> {
    if (!this.ALLOWED_HTTP_METHODS.includes(httpMethod)) {
      throw new Error('unknown or not allowed HttpMethod [' + httpMethod + ']');
    }
    const requestDTO: RequestQueueEntry = new RequestQueueEntry(
      requestType,
      new Date().getTime(),
      requestUrl,
      httpMethod,
      jsonData,
      thumbnail,
      binaryData,
      successCallback,
      errorCallback,
      this.REQUEST_OVERHEAD_BYTES + payloadBytes // payload + estimated overhead for http header
    );
    return this.addQueueEntry(requestDTO);
  }

  private blobToArrayBuffer(blob: Blob): Promise<ArrayBuffer> {
    return new Promise<ArrayBuffer>((resolve, reject) => {
      const reader = new FileReader();
      reader.addEventListener('loadend', () => {
        resolve(reader.result);
      });
      reader.addEventListener('error', reject);
      if (blob && blob instanceof Blob) {
        reader.readAsArrayBuffer(blob);
      } else {
        resolve(null);
      }
    });
  }

  private addQueueEntry(request: RequestQueueEntry): Observable<number> {
    return new Observable((observer) => {
      this.blobToArrayBuffer(request.thumbnail)
        .then(value => {
          request.thumbnail = value;
          return this.blobToArrayBuffer(request.binaryData);
        })
        .then(value => {
          request.binaryData = value;
          this.getDatabase().subscribe((db) => {
              const transaction = db.transaction([this.TABLE_NAME], 'readwrite');
              transaction.onerror = (error) => {
                console.error('indexedDB transaction error during addQueueEntry', error);
              };
              transaction.oncomplete = () => {
                this.calcCurrentQueueSize();
                this.processQueueIfNecessary();
              };

              transaction.onabort = (event) => {
                const error = event.target['error'];
                if (error && error.name === 'QuotaExceededError') {
                  observer.error(error);
                }
              };

              const addRequest = transaction.objectStore(this.TABLE_NAME).add(request);
              addRequest.onsuccess = (success: any) => {
                const queueId = success.currentTarget.result;
                this.queueEntryStates[queueId] = new RequestQueueEntryState(queueId, RequestQueueStateEnum.QUEUED,
                  request.bytes, 0, 0);
                observer.next(queueId); // return the id of the created row
                observer.complete();
              };
              addRequest.onerror = (error) => {
                console.error('indexedDB transaction error during addQueueEntry', error);
                observer.error(error);
              };
            },
            (error) => {
              console.error('addQueueEntry failed', error);
            }
          );
        }).catch(reason => {
        console.error('addQueueEntry failed', reason);
      });
    });
  }

  private updateCurrentUploadedSize(bytesProcessed: number): void {
    this.isClientOffline = false;
    this.currentRequestProcessedBytes = bytesProcessed;
    this.updateEntryState(this.currentRequestId, RequestQueueStateEnum.TRANSFERRING, bytesProcessed);
    this.updateQueueState();
  }

  private updateEntryState(queueId: number, state: RequestQueueStateEnum, bytesProcessed?: number) {
    if (this.queueEntryStates[queueId] === undefined) {
      this.queueEntryStates[queueId] = new RequestQueueEntryState(queueId, state, 1, 0, 0);
      // TODO ak fetch totalBytes from indexedDB and update it
    }
    this.ngZone.run(() => {
      // console.log('updateEntryState: set entry ' + queueId + ' to state ' + state + ' and ' + bytesProcessed + ' bytes');
      this.queueEntryStates[queueId].state = state;
      if (bytesProcessed) {
        const totalBytes = this.queueEntryStates[queueId].totalBytes;
        this.queueEntryStates[queueId].bytesProcessed = bytesProcessed;
        this.queueEntryStates[queueId].percentProcessed = Math.floor(100 * bytesProcessed / totalBytes);
      }
    });
  }

  private removeFromQueue(id: number): void {
    this.getDatabase().subscribe(
      (db) => {
        const transaction = db.transaction([this.TABLE_NAME], 'readwrite');
        transaction.onerror = (error) => {
          console.error('indexedDB transaction error during removeFromQueue', error);
        };
        transaction.oncomplete = () => {
          this.isQueueProcessingActive = false;
          this.currentRequestProcessedBytes = 0;
          this.calcCurrentQueueSize();
          this.processQueueIfNecessary();
        };

        const addRequest = transaction.objectStore(this.TABLE_NAME).delete(id);
        addRequest.onerror = (error) => {
          console.error('indexedDB transaction error during removeFromQueue', error);
        };

      }, (error) => {
        console.error('removeFromQueue failed', error);
      });
  }

  private updateQueueState(): void {
    this.ngZone.run(() => {
      if (this.entryCount > 0) {
        if (this.isClientOffline) {
          this.queueState = RequestQueueStateEnum.OFFLINE;
          this.currentRequestProcessedBytes = 0;
          this.updateEntryState(this.currentRequestId, RequestQueueStateEnum.OFFLINE, 0);
        } else {
          this.queueState = RequestQueueStateEnum.TRANSFERRING;
        }
      } else {
        this.queueState = RequestQueueStateEnum.IDLE;
      }
    });
  }

  private calcCurrentQueueSize(): void {
    let entries = 0;
    let queueSize = 0;

    this.getDatabase().subscribe(
      (db) => {
        const transaction = db.transaction([this.TABLE_NAME], 'readonly');
        transaction.onerror = (error) => {
          console.error('indexedDB transaction error during calcCurrentQueueSize', error);
        };

        const openCursorRequest: IDBRequest = transaction.objectStore(this.TABLE_NAME).openCursor();
        openCursorRequest.onsuccess = (event) => {
          const cursor: IDBCursorWithValue = (<IDBRequest> event.target).result;
          if (cursor) {
            if (this.isOwnCursor(cursor)) {
              entries += 1;
              queueSize += cursor.value.bytes;
              if (!this.queueEntryStates[cursor.primaryKey]) {
                this.queueEntryStates[cursor.primaryKey] = new RequestQueueEntryState(cursor.primaryKey,
                  RequestQueueStateEnum.QUEUED, cursor.value.bytes, 0, 0);
              }
            }
            cursor.continue();
          } else {
            // reached end of store
            this.entryCount = entries;
            this.queueSize = queueSize;
            this.updateQueueState();
          }
        };
        openCursorRequest.onerror = (error) => {
          console.error('indexedDB transaction error during calcCurrentQueueSize', error);
          this.entryCount = 0;
        };
      },
      (error) => {
        console.error('calcCurrentQueueSize failed', error);
      });
  }

  private processQueueIfNecessary(): void {
    if (!this.isQueueProcessingActive && this.DEBUG_QUEUE_PROCESSING_ENABLED) {
      this.isQueueProcessingActive = true;

      this.getDatabase().subscribe(
        (db) => {
          const transaction = db.transaction([this.TABLE_NAME], 'readonly');
          transaction.onerror = (error) => {
            console.error('indexedDB transaction error during processQueueIfNecessary', error);
          };

          const openCursorRequest = transaction.objectStore(this.TABLE_NAME).openCursor();
          openCursorRequest.onsuccess = (event) => {
            const cursor: IDBCursorWithValue = (<IDBRequest> event.target).result;
            if (cursor) {
              if (this.isOwnCursor(cursor)) {
                const request: RequestQueueEntry = cursor.value;
                request.binaryData = new Blob([cursor.value.binaryData]);
                request.thumbnail = new Blob([cursor.value.thumbnail]);
                this.currentRequestId = cursor.primaryKey;
                this.currentRequestProcessedBytes = 0;
                this.currentRequestBytes = request.bytes;
                if (request.httpMethod === 'DELETE') {
                  this.sendDeleteRequest(request);
                } else {
                  this.sendMultipartRequest(request);
                }
              }
              cursor.continue();
            } else {
              // reached end of store, nothing more to do
              this.isQueueProcessingActive = false;
              this.currentRequestId = null;
              this.currentRequestProcessedBytes = 0;
              this.currentRequestBytes = 0;
            }
          };
          openCursorRequest.onerror = (error) => {
            console.error('indexedDB transaction error during processQueueIfNecessary', error);
          };
        },
        (error) => {
          console.error('processQueueIfNecessary failed', error);
        });
    }
  }

  private sendDeleteRequest(requestDTO: RequestQueueEntry): void {
    const headers = new HttpHeaders({
      'Accept': 'application/json'
    });
    const httpOptions = {
      headers: headers,
    };
    this.http.delete(requestDTO.requestUrl, httpOptions).subscribe(
      (responseBody: Object) => {
        this.handleBackendSuccess(requestDTO, 204, responseBody);
      },
      (errorResponse: Response) => {
        if (errorResponse.status !== 404) { // 404 means the resource was already deleted
          this.handleBackendError(requestDTO, errorResponse.status, errorResponse.body);
        }
      }
    );
  }

  private sendMultipartRequest(requestDTO: RequestQueueEntry): void {
    const headers = new HttpHeaders({
      'Content-Type': 'multipart/form-data',
      'Accept': 'application/json'
    });
    const httpOptions = {
      headers: headers,
      reportProgress: true
    };

    const formData: FormData = new FormData();
    if (requestDTO.jsonData) {
      Object.keys(requestDTO.jsonData).map(
        (key) => {
          formData.append(key, toJsonBlob(requestDTO.jsonData[key]));
        });
    }
    formData.append('content', requestDTO.binaryData);
    formData.append('thumbnail', requestDTO.thumbnail);
    const httpRequest = new HttpRequest(requestDTO.httpMethod, requestDTO.requestUrl, formData, httpOptions);
    this.http.request<any>(httpRequest).subscribe(
      (event: HttpEvent<any>) => {
        if (event.type === HttpEventType.UploadProgress) {
          this.updateCurrentUploadedSize(event.loaded);
        }
        if (event.type === HttpEventType.Response) {
          this.handleBackendSuccess(requestDTO, event.status, event.body);
        }
      },
      (errorResponse: Response) => this.handleBackendError(requestDTO, errorResponse.status, errorResponse.body)
    );
  }

  private handleBackendSuccess(request: RequestQueueEntry, responseStatus: number, body: any): void {
    if (responseStatus >= 200 && responseStatus <= 205) {
      this.isClientOffline = false;
      if (request.successCallback) {
        const callback: Function = this.getCallBackMethod(request.successCallback);
        try {
          callback(request, responseStatus, body);
        } catch (error) {
          console.error('successCallBack execution failed', error);
        }
      }
      this.updateEntryState(request.queueId, RequestQueueStateEnum.FINISHED, request.bytes);
      this.removeFromQueue(request.queueId);
    } else {
      this.handleBackendError(request, responseStatus, body);
    }
  }

  private handleBackendError(request: RequestQueueEntry, responseStatus: number, body: any): void {
    console.error('got backend-error', responseStatus, body);
    if (responseStatus === undefined || responseStatus === 0) {
      this.isClientOffline = true;
      this.updateQueueState();
      this.triggerDelayedRetry();
    } else if (responseStatus === 504) {
      this.isClientOffline = true;
      this.updateQueueState();
      this.triggerDelayedRetry();
    } else if (responseStatus === 401) {
      console.error('HTTP-401 (session timeout)');
      // stop processing
      // TODO implement continue processing or redirect to login page?
      this.isQueueProcessingActive = false;
    } else if (responseStatus === 403) {
      console.error('HTTP-403 (unauthorized)');
      // stop processing
      // TODO implement continue processing or redirect to login page?
      this.isQueueProcessingActive = false;
    } else {
      if (request.errorCallback) {
        const callback: Function = this.getCallBackMethod(request.errorCallback);
        callback(request, body ? body.json() : null);
      }
      this.triggerDelayedRetry();
    }
  }

  private triggerDelayedRetry(): void {
    setTimeout(() => {
      this.isQueueProcessingActive = false;
      this.processQueueIfNecessary();
    }, this.RETRY_DELAY_WHEN_OFFLINE);
  }

  private getCallBackMethod(methodAlias: string): Function {
    return this.callBackMap[methodAlias];
  }

  private isOwnCursor(cursor) {
    return cursor &&
      cursor.value &&
      cursor.value.jsonData &&
      cursor.value.jsonData.item &&
      cursor.value.jsonData.item.owner === this.authService.getSessionUser().userId;
  }
}
