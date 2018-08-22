import {Inject, Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs/Observable';
import {SessionUser} from './user-session';
import {UserSignUpState} from './user-sign-up-state.enum';
import * as _ from 'lodash';
import {
  EnrollmentCodeRequest,
  EnrollmentConfirmation,
  EnrollmentRequest,
  Identity,
  IdentityDecrypted
} from './enrollment';
import {HttpErrorService} from '../app-http/http-error.service';
import {CryptoService} from '../crypto/crypto.service';
import {toDateTime} from '../date/date.type';
import 'rxjs/add/observable/fromPromise';
import 'rxjs/add/operator/switchMap';
import {ENV_SETTINGS_TOKEN, EnvSettings} from '../../settings-loader';
import {CryptoItemService} from '../crypto/crypto-item.service';

@Injectable()
export class UserService {

  private INDEXEDDB_STORE_VERSION = 1;
  private DB_NAME = 'identityDB';
  private TABLE_NAME = 'identities';
  private PRIMARY_KEY = 'userId';

  private db: IDBDatabase;
  private isDBReady = false;

  constructor(private http: HttpClient,
              @Inject(ENV_SETTINGS_TOKEN) private config: EnvSettings,
              private errorService: HttpErrorService,
              private cryptoItemService: CryptoItemService,
              private cryptoService: CryptoService) {
    this.initDB();
  }

  enrollUser(sessionUser: SessionUser, pwd: string): Promise<any> {
    const keys = this.cryptoService.exportPublicKeys();
    const body: EnrollmentRequest = new EnrollmentRequest();
    body.authenticationKey = keys.authenticationKey;
    body.contentKey = keys.contentKey;
    body.signatureKey = keys.signatureKey;
    body.email = sessionUser.user.email;
    return this.http.post<Identity>(this.config.identityApiHost + '/api/v1/enrollment/create', body)
      .toPromise()
      .then((response: Identity) => {
        sessionUser.userId = response.id;
        return Promise.all([
          this.cryptoService.updateKeyId(response.signatureKey),
          this.cryptoService.updateKeyId(response.authenticationKey),
          this.cryptoService.updateKeyId(response.contentKey)]
        );
      })
      .then(() => {
        return this.cryptoService.exportKeystore(pwd);
      });
  }

  confirmIdentity(sessionUser: SessionUser, confirmationCode: string): Observable<SessionUser> {
    const confirmation: EnrollmentConfirmation = new EnrollmentConfirmation();
    const map = new Map();
    sessionUser.user.enrolled = toDateTime(new Date());
    map.set('profileBlob', JSON.stringify(sessionUser.user));
    return Observable.fromPromise(this.cryptoService.encrypt(map))
      .switchMap((value) => {
        confirmation.users = {
          [sessionUser.userId]: {key: value[0]}
        };
        confirmation.profileBlob = value[1].get('profileBlob') as string;
        return this.cryptoService.createRegistrationConfirmation(sessionUser.userId, confirmationCode);
      })
      .switchMap(value => {
        confirmation.jwt = value;
        return this.http.post<Identity>(this.config.identityApiHost + '/api/v1/enrollment/confirm', confirmation);
      })
      .switchMap(identity => {
        return this.updateUserFromIdentity(identity, sessionUser);
      });
  }

  updateUserFromIdentity(identity: Identity, sessionUser: SessionUser): Observable<SessionUser> {
    return this.cryptoItemService.decryptIdentity(identity, sessionUser.userId)
      .switchMap((identityDecrypted: IdentityDecrypted) => {
        return this.updateUserFromDb(sessionUser.userId, new SessionUser(identityDecrypted.profile, UserSignUpState.ACTIVATED));
      });
  }

  requestNewActivationCode(sessionUser: SessionUser, email: string): Observable<SessionUser> {
    return Observable.fromPromise(this.cryptoService.createRegistrationConfirmation(sessionUser.userId))
      .switchMap(value => {
        const request: EnrollmentCodeRequest = new EnrollmentCodeRequest();
        request.jwt = value;
        request.email = email;
        return this.http.post<Identity>(this.config.identityApiHost + '/api/v1/enrollment/requestCode', request);
      })
      .switchMap(identity => {
        return this.getUserFromDb(sessionUser.userId);
      })
      .switchMap(user => {
        user.signUpState = UserSignUpState.CREATED;
        user.user.email = email;
        return this.updateUserFromDb(sessionUser.userId, user);
      });
  }

  getUsersFromDb(): Observable<SessionUser[]> {
    return new Observable<SessionUser[]>(observer => {
      this.getDatabase()
        .subscribe((db) => {
            const transaction = db.transaction([this.TABLE_NAME], 'readwrite');
            transaction.onerror = (error) => {
              console.error('indexedDB transaction error during getUsersFromDb', error);
            };
            const requests: SessionUser[] = [];
            const openCursorRequest: IDBRequest = transaction.objectStore(this.TABLE_NAME).openCursor();
            openCursorRequest.onsuccess = (event) => {
              const cursor: IDBCursorWithValue = (<IDBRequest> event.target).result;
              if (cursor) {
                const actual = new Date();
                if (cursor.value.signUpState !== UserSignUpState.ACTIVATED && (!cursor.value.createdAt ||
                    cursor.value.createdAt <= actual.setHours(actual.getHours() - 12))) {
                  transaction.objectStore(this.TABLE_NAME).delete(cursor.value.userId);
                } else {
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
              console.error('indexedDB transaction error during getUsersFromDb', error);
              observer.error(error);
            };
          },
          (error) => {
            console.error('getUsersFromDb failed', error);
          });
    });
  }

  getUserFromDb(userId: string): Observable<SessionUser> {
    return new Observable<SessionUser>(observer => {
      this.getDatabase()
        .subscribe((db) => {
            const transaction = db.transaction([this.TABLE_NAME], 'readonly');
            transaction.onerror = (error) => {
              console.error('indexedDB transaction error during getUserFromDb', error);
            };

            let request: SessionUser;
            const openCursorRequest: IDBRequest = transaction.objectStore(this.TABLE_NAME).openCursor(userId);
            openCursorRequest.onsuccess = (event) => {
              const cursor: IDBCursorWithValue = (<IDBRequest> event.target).result;
              if (cursor) {
                request = cursor.value;
                cursor.continue();
              } else {
                // end of table reached
                observer.next(request);
                observer.complete();
              }
            };
            openCursorRequest.onerror = (error) => {
              console.error('indexedDB transaction error during getUserFromDb', error);
              observer.error(error);
            };
          },
          (error) => {
            console.error('getUserFromDb failed', error);
          });
    });
  }

  addUserToDb(request: SessionUser): Observable<SessionUser> {
    return new Observable((observer) => {
      if (!request.userId) {
        observer.error('No Id set!');
        return;
      }
      this.getDatabase()
        .subscribe((db) => {
            const transaction = db.transaction([this.TABLE_NAME], 'readwrite');
            transaction.onerror = (error) => {
              console.error('indexedDB transaction error during addUserToDb', error);
            };
            const actual = new Date();
            request.createdAt = actual;
            const addRequest = transaction.objectStore(this.TABLE_NAME).add(request);
            addRequest.onsuccess = (success: any) => {
              request.userId = success.currentTarget.result;
              observer.next(request); // return the user of the created row
              observer.complete();
            };
            addRequest.onerror = (error) => {
              console.error('indexedDB transaction error during addUserToDb', error);
              observer.error(error);
            };
          },
          (error) => {
            console.error('addUserToDb failed', error);
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
      this.db.createObjectStore(this.TABLE_NAME, {keyPath: this.PRIMARY_KEY});
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

  private updateUserFromDb(userId: string, user: SessionUser): Observable<SessionUser> {
    return new Observable<SessionUser>(observer => {
      this.getDatabase().subscribe(
        (db) => {
          const transaction = db.transaction([this.TABLE_NAME], 'readwrite');
          transaction.onerror = (error) => {
            console.error('indexedDB transaction error during updateUserFromDb', error);
          };

          let origin: SessionUser;
          const openCursorRequest: IDBRequest = transaction.objectStore(this.TABLE_NAME).openCursor(userId);
          openCursorRequest.onsuccess = (event) => {
            const cursor: IDBCursorWithValue = (<IDBRequest> event.target).result;
            if (cursor) {
              origin = cursor.value;
              this.updateUserDBEntry(origin, user);
              cursor.update(origin);
              cursor.continue();
            } else {
              // end of table reached
              observer.next(origin);
              observer.complete();
            }
          };
          openCursorRequest.onerror = (error) => {
            console.error('indexedDB transaction error during updateUserFromDb', error);
            observer.error(error);
          };
        },
        (error) => {
          console.error('updateUserFromDb failed', error);
        });
    });
  }

  private updateUserDBEntry(origin: SessionUser, user: SessionUser) {
    origin.signUpState = user.signUpState;
    _.assign(origin.user, user.user);
  }
}
