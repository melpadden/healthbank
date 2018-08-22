import {
  RESPONSE_CONTINUATION_HEADER,
  TimeLineItem,
  TimeLineItemEncrypted,
  TimelineResponseContinuation
} from '../models/timeline';
import {Inject, Injectable} from '@angular/core';
import {Observable} from 'rxjs/Observable';
import * as urlTemplate from 'url-template';
import 'rxjs/Observable';
import {HttpClient, HttpHeaders, HttpResponse} from '@angular/common/http';
import {BehaviorSubject} from 'rxjs/BehaviorSubject';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/share';
import 'rxjs/add/operator/mergeMap';
import 'rxjs/add/operator/switchMap';
import {HttpErrorService} from '../../app-http/http-error.service';
import {RequestQueueService} from '../../request-queue/request-queue.service';
import {AuthService} from '../../auth/auth.service';
import {CryptoService} from '../../crypto/crypto.service';
import {RequestTypeEnum} from '../../request-queue/request-type.enum';
import {RequestQueueEntry} from '../../request-queue/request-queue-entry';
import {IdentityService} from '../../contact/services/identity.service';
import {ContactService} from '../../contact/services/contact.service';
import {ENV_SETTINGS_TOKEN, EnvSettings} from '../../../settings-loader';
import {CryptoItemService} from '../../crypto/crypto-item.service';
import * as uuidv1 from 'uuid/v1';
import * as _ from 'lodash';

/**
 * Timeline Service.
 */
@Injectable()
export class TimeLineService {

  private static timeLineItemsSubject: BehaviorSubject<TimeLineItem[]> = new BehaviorSubject<TimeLineItem[]>([]);
  private static timeLineItemIdsSuccessfullyDeleted: string[] = [];
  private static _itemList: TimeLineItem[] = [];

  private CREATE_TIMELINE_ITEM_SUCCESS_CALLBACK = 'CREATE_ITEM_SUCCESS';
  private DELETE_TIMELINE_ITEM_SUCCESS_CALLBACK = 'DELETE_ITEM_SUCCESS';

  private timeLineItemIdsMarkedForDeletion: string[] = [];

  constructor(private http: HttpClient,
              @Inject(ENV_SETTINGS_TOKEN) private config: EnvSettings,
              private errorService: HttpErrorService,
              private requestQueueService: RequestQueueService,
              private authService: AuthService,
              private identityService: IdentityService,
              private contactService: ContactService,
              private cryptoItemService: CryptoItemService,
              private cryptoService: CryptoService) {
    this.initTimeLineItemIdsMarkedForDeletion();

    this.requestQueueService.registerCallBackMethod(
      this.CREATE_TIMELINE_ITEM_SUCCESS_CALLBACK, TimeLineService.updateCreatedTimeLineItem);
    this.requestQueueService.registerCallBackMethod(
      this.DELETE_TIMELINE_ITEM_SUCCESS_CALLBACK, TimeLineService.removeDeletedTimeLineItemFromList);
  }

  createItemMultiPart(memberId: string, item: TimeLineItem, binary: Blob, thumbnail: Blob): Observable<number> {
    const safeUrl = urlTemplate.parse(this.config.timelineApiHost + '/api/v1/timeline/{memberId}/items').expand({memberId});
    item.content = binary;
    item.thumbnail = thumbnail;
    item.id = uuidv1();
    return Observable.fromPromise(this.cryptoItemService.encryptTimeLineItem(item))
      .switchMap(encryptedItem => {
        return this.requestQueueService.queueMultipartRequest(
          RequestTypeEnum.CREATE_ITEM,
          safeUrl,
          'POST',
          {item: encryptedItem.timelineItemEncrypted},
          encryptedItem.content,
          encryptedItem.thumbnail,
          this.CREATE_TIMELINE_ITEM_SUCCESS_CALLBACK,
          null);
      });
  }

  reloadItemsSubject(memberId: string): Observable<string> {
    this.resetItemsSubject();

    return this.getItemsFromQueue()
      .switchMap((resultList: TimeLineItem[]) => {
        this.pushItemsToSubject(resultList, true);
        return this.getItemsFromBackend(memberId);
      })
      .map((result: TimelineResponseContinuation) => {
        this.pushItemsToSubject(result.timelineItems);
        return result.responseContinuation;
      });
  }

  getItemsSubject(): BehaviorSubject<TimeLineItem[]> {
    return TimeLineService.timeLineItemsSubject;
  }

  getMore(memberId: string, token: string): Observable<string> {
    return this.getItemsFromBackend(memberId, token)
      .map((result: TimelineResponseContinuation) => {
        this.pushItemsToSubject(result.timelineItems);
        return result.responseContinuation;
      });
  }

  getContent(itemId: string, decryptParams: { key: string, signatureKey?: any }): Observable<Blob> {
    return this.http.get(itemId, {responseType: 'blob'})
      .switchMap(value => {
        const decrypt = new Map();
        decrypt.set('content', value);
        if (decryptParams && decryptParams.signatureKey) {
          return this.cryptoService.decryptShared(decrypt, decryptParams.key, decryptParams.signatureKey)
            .then(result => {
              return result.get('content') as Blob;
            });
        }
        return this.cryptoService.decrypt(decrypt, decryptParams.key)
          .then(result => {
            return result.get('content') as Blob;
          });
      });
  }

  /**
   * Retrieves one timeline item by member and item id.
   * @param {string} memberId
   * @param {string} itemId
   * @returns {Observable<TimeLineItem>}
   */
  getItem(referenceUrl: string): Observable<TimeLineItem> {
    return this.http.get<TimeLineItemEncrypted>(referenceUrl).switchMap(value => {
      return this.decryptTimeLineItem(value);
    }).share();
  }

  /**
   * Deletes a timeline item by ownerId and itemId.
   * @param {string} memberId
   * @param {string} itemId
   */
  deleteItem(memberId: string, itemId: string): void {
    const safeUrl = urlTemplate.parse(this.config.timelineApiHost + '/api/v1/timeline/{memberId}/items/{itemId}').expand({
      memberId,
      itemId
    });
    this.timeLineItemIdsMarkedForDeletion.push(itemId);
    this.requestQueueService.queueJsonRequest(
      RequestTypeEnum.DELETE_ITEM,
      safeUrl,
      'DELETE',
      {id: itemId, item: {owner: memberId}},
      this.DELETE_TIMELINE_ITEM_SUCCESS_CALLBACK,
      null)
      .subscribe(() => {
        }, error => {
          console.error(`delete item with id ${itemId} failed with error`, error);
        }
      );
  }

  decryptTimeLineItem(item: TimeLineItemEncrypted, thumbnail?: any): Promise<TimeLineItem> {
    if (item.owner !== this.authService.getSessionUser().userId) {
      return this.cryptoItemService.decryptSharedTimeLineItem(item, this.identityService.getIdentityFromCache(item.owner), thumbnail);
    }
    return this.cryptoItemService.decryptTimeLineItem(item, thumbnail);
  }

  decryptResponseContinuation(result: HttpResponse<TimeLineItemEncrypted[]>): Promise<TimelineResponseContinuation> {
    return this.decryptTimeLineItems(result.body)
      .then(items => {
        const mappedResult: TimelineResponseContinuation = new TimelineResponseContinuation();
        mappedResult.responseContinuation = result.headers.get(RESPONSE_CONTINUATION_HEADER);
        mappedResult.timelineItems = items;
        return mappedResult;
      });
  }

  markItemsQueuedForDeletion(timelineItems: TimeLineItem[]) {
    timelineItems.forEach((timeLineItem) => {
      timeLineItem.markedForDeletion = this.timeLineItemIdsMarkedForDeletion.includes(timeLineItem.id);
    });
  }

  resetItemsSubject() {
    TimeLineService._itemList.length = 0;
  }

  static removeDeletedTimeLineItemFromList(requestQueueEntry: RequestQueueEntry, httpCode: number, responseBody: any) {
    // check if delete timeLineItem is in current shown timeLineItem-list
    TimeLineService.timeLineItemIdsSuccessfullyDeleted.push(requestQueueEntry.jsonData.id);
    let subjectUpdateNecessary = false;
    const resultList: TimeLineItem[] = [];
    TimeLineService._itemList.forEach((item) => {
      if (item.id === requestQueueEntry.jsonData.id) {
        subjectUpdateNecessary = true;
      } else {
        resultList.push(item);
      }
    });
    if (subjectUpdateNecessary) {
      TimeLineService._itemList = resultList;
      TimeLineService.timeLineItemsSubject.next(resultList);
      _.remove(TimeLineService.timeLineItemIdsSuccessfullyDeleted, (value => value === requestQueueEntry.jsonData.id));
    }
  }

  static updateCreatedTimeLineItem(requestQueueEntry: RequestQueueEntry, httpCode: number, createdTimeLineItem: TimeLineItem) {
    let subjectUpdateNecessary = false;
    const resultList: TimeLineItem[] = [];
    TimeLineService._itemList.forEach((item) => {
      if (item.requestQueueId === requestQueueEntry.queueId) {
        subjectUpdateNecessary = true;
        item.requestQueueId = null;
        if (createdTimeLineItem !== null) {
          item.id = createdTimeLineItem.id;
          item.reference = createdTimeLineItem.reference;
          item.contentReference = createdTimeLineItem.contentReference;
          item.uploadTime = createdTimeLineItem.uploadTime;
        } else {
          console.warn('backend provided no data for newly created timeline item => resource download will fail');
        }
      }
      resultList.push(item);
    });
    if (subjectUpdateNecessary) {
      TimeLineService._itemList = resultList;
      TimeLineService.timeLineItemsSubject.next(resultList);
    }
  }

  private getItemsFromBackend(memberId: string, token?: string): Observable<TimelineResponseContinuation> {
    const safeUrl = urlTemplate.parse(this.config.timelineApiHost + '/api/v1/timeline/{memberId}/items').expand({memberId});
    const params = new HttpHeaders().set(RESPONSE_CONTINUATION_HEADER, token ? token : '');
    return this.http.get<TimeLineItemEncrypted[]>(safeUrl, {headers: params, observe: 'response'})
      .switchMap((result: HttpResponse<TimeLineItemEncrypted[]>) => {
        return this.decryptResponseContinuation(result);
      })
      .map((decrypted) => {
        this.markItemsQueuedForDeletion(decrypted.timelineItems);
        return decrypted;
      });
  }

  private getItemsFromQueue(): Observable<TimeLineItem[]> {
    return this.requestQueueService.getQueuedRequests(RequestTypeEnum.CREATE_ITEM)
      .switchMap((requestList: RequestQueueEntry[]) => {
        return Promise.all(requestList.map((requestEntry: RequestQueueEntry) => {
          return this.decryptTimeLineItem(requestEntry.jsonData.item, requestEntry.thumbnail)
            .then(value => {
              value.requestQueueId = requestEntry.queueId;
              return value;
            });
        }));
      });
  }

  private decryptTimeLineItems(items: TimeLineItemEncrypted[]): Promise<TimeLineItem[]> {
    const userId = this.authService.getSessionUser().userId;
    return Promise.all(items
      .filter((item) => {
        return item.users !== undefined && !!item.users[userId];
      }).map(item => {
        return this.decryptTimeLineItem(item);
      })
    );
  }

  private pushItemsToSubject(timeLineItems: TimeLineItem[], insertOnTop: boolean = false) {
    const resultList: TimeLineItem[] = [];
    TimeLineService._itemList.forEach((timeLineItem) => {
      resultList.push(timeLineItem);
    });
    timeLineItems.forEach((timeLineItem) => {
      _.remove(resultList, (item: TimeLineItem) => {
        return item.id === timeLineItem.id;
      });
      if (!TimeLineService.timeLineItemIdsSuccessfullyDeleted.includes(timeLineItem.id)) {
        if (insertOnTop) {
          resultList.splice(0, 0, timeLineItem);
        } else {
          resultList.push(timeLineItem);
        }
      } else {
        _.remove(TimeLineService.timeLineItemIdsSuccessfullyDeleted, (value => value === timeLineItem.id));
      }
    });
    TimeLineService._itemList = resultList;
    TimeLineService.timeLineItemsSubject.next(resultList);
  }

  private initTimeLineItemIdsMarkedForDeletion() {
    this.requestQueueService.getQueuedRequests(RequestTypeEnum.DELETE_ITEM).subscribe(
      (requestList: RequestQueueEntry[]) => {
        requestList.forEach((requestEntry: RequestQueueEntry) => {
          this.timeLineItemIdsMarkedForDeletion.push(requestEntry.jsonData.id);
        });
        let subjectUpdateNecessary = false;
        TimeLineService._itemList.forEach((item) => {
          if (this.timeLineItemIdsMarkedForDeletion.includes(item.id)) {
            item.markedForDeletion = true;
            subjectUpdateNecessary = true;
          }
        });
        if (subjectUpdateNecessary) {
          // update deletion state of currently observed items
          this.updateSubjectItems();
        }
      },
      (error) => {
        console.error('initTimeLineItemIdsMarkedForDeletion failed', error);
      }
    );
  }

  private updateSubjectItems() {
    this.pushItemsToSubject([]);
  }
}
