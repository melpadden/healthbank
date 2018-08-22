import {Inject, Injectable, OnDestroy} from '@angular/core';
import {Observable} from 'rxjs/Observable';
import 'rxjs/Observable';
import {HttpClient} from '@angular/common/http';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/share';
import {Contact, ContactDecrypted, ContactInfo, Invitation, InvitationDB} from '../models/contact';
import {BehaviorSubject} from 'rxjs/BehaviorSubject';
import {HttpErrorService} from '../../app-http/http-error.service';
import {AuthService} from '../../auth/auth.service';
import {CryptoService} from '../../crypto/crypto.service';
import {toDateTime} from '../../date/date.type';
import * as urlTemplate from 'url-template';
import {Subject} from 'rxjs/Subject';
import * as _ from 'lodash';
import {CacheService} from '../../cache/cache.service';
import 'rxjs/add/operator/switchMap';
import 'rxjs/add/operator/take';
import {ENV_SETTINGS_TOKEN, EnvSettings} from '../../../settings-loader';
import {CryptoItemService} from '../../crypto/crypto-item.service';

/**
 * Contact Service.
 */
@Injectable()
export class ContactService implements OnDestroy {

  private static pendingInvitationsSubject: BehaviorSubject<InvitationDB[]> = new BehaviorSubject<InvitationDB[]>([]);
  private static _pendingInvitationsList: InvitationDB[] = [];
  private ngUnsubscribe$: Subject<boolean> = new Subject<boolean>();

  private INDEXEDDB_STORE_VERSION = 1;
  private DB_NAME = 'invitationDB';
  private TABLE_NAME = 'invitations';
  private PRIMARY_KEY = 'id';
  private db: IDBDatabase;
  private isDBReady = false;

  constructor(private http: HttpClient,
              @Inject(ENV_SETTINGS_TOKEN) private config: EnvSettings,
              private errorService: HttpErrorService,
              private authService: AuthService,
              private cryptoService: CryptoService,
              private cacheService: CacheService,
              private cryptoItemService: CryptoItemService) {
    this.initDB();
  }

  ngOnDestroy() {
    this.ngUnsubscribe$.next(true);
    this.ngUnsubscribe$.complete();
  }

  // [ payload, token, id ]

  createInvitation(): Observable<string> {
    const invitation = new Invitation();
    const now = new Date();
    now.setDate(now.getDate() + 1);
    invitation.validUntil = toDateTime(now);
    let token: string;
    const user = new Map();
    user.set('data', JSON.stringify(this.getMyContactInfo()));
    return Observable.fromPromise(this.cryptoService.encryptTokenKey(user))
      .switchMap(value => {
        invitation.transientContactInfo = value[0].get('data') as string;
        invitation.id = value[2];
        token = value[1];
        return this.http.put<Invitation>(this.config.identityApiHost + '/api/v1/invitations', invitation);
      })
      .switchMap((invite: Invitation) => {
        return this.addInvitationToDb(invitation, token);
      }).map(() => {
        return token;
      });

  }

  acceptInvitation(token: string): Observable<ContactDecrypted> {
    const mySelf = new Map();
    mySelf.set('data', JSON.stringify(this.getMyContactInfo()));
    let invitationId: string;
    return Observable.fromPromise(this.cryptoService.encryptTokenKey(mySelf, token))
      .switchMap(consumerEncryptedInvitation => {
        const consumerInvitation: Invitation = new Invitation();
        consumerInvitation.id = consumerEncryptedInvitation[2];
        invitationId = consumerInvitation.id;
        consumerInvitation.transientContactInfo = consumerEncryptedInvitation[0].get('data') as string;
        const now = new Date();
        now.setDate(now.getDate() + 1);
        consumerInvitation.validUntil = toDateTime(now);
        return this.confirmInvitation(consumerEncryptedInvitation[2], consumerInvitation);
      })
      .switchMap((creatorInvitation: Invitation) => {
        const receivedInvitationUser = new Map();
        receivedInvitationUser.set('data', creatorInvitation.transientContactInfo);
        return this.cryptoService.decryptTokenKey(receivedInvitationUser, token);
      })
      .switchMap(decrypted => {
        const encryptOtherWithMyKey = new Map();
        encryptOtherWithMyKey.set('data', decrypted.get('data'));
        return this.cryptoService.encrypt(encryptOtherWithMyKey);
      })
      .switchMap(personalEncryptedOther => {
        const contact = new Contact();
        contact.userId = this.authService.getSessionUser().userId;
        contact.contactInfo = personalEncryptedOther[1].get('data') as string;
        contact.invitationId = invitationId;
        contact.users = {[this.authService.getSessionUser().userId]: {key: personalEncryptedOther[0]}};
        return this.addContact(contact.invitationId, contact);
      });
  }

  checkAccepted(id: string, token: string): Observable<ContactDecrypted> {
    return this.getConfirmation(id)
      .switchMap(consumerInvitation => {
        const map = new Map();
        map.set('contact', consumerInvitation.transientContactInfo);
        return this.cryptoService.decryptTokenKey(map, token);
      })
      .switchMap(decryptedConsumerInvitation => {
        const encryptConsumerWithMyKey = new Map();
        encryptConsumerWithMyKey.set('contact', decryptedConsumerInvitation.get('contact'));
        return this.cryptoService.encrypt(encryptConsumerWithMyKey);
      })
      .switchMap(personalEncryptedConsumer => {
        const contact = new Contact();
        contact.userId = this.authService.getSessionUser().userId;
        contact.contactInfo = personalEncryptedConsumer[1].get('contact') as string;
        contact.invitationId = id;
        contact.users = {[this.authService.getSessionUser().userId]: {key: personalEncryptedConsumer[0]}};
        return this.addContact(id, contact);
      });
  }

  getPendingInvitationsSubject(): BehaviorSubject<Array<InvitationDB>> {
    return ContactService.pendingInvitationsSubject;
  }

  getPendingInvitations(): BehaviorSubject<Array<InvitationDB>> {
    this.getPendingInvitationsFromDb()
      .take(1)
      .subscribe(value => {
    this.resetPendingInvitationsSubject();
        this.pushItemsToPendingInvitationsSubject(value);
      });
    return ContactService.pendingInvitationsSubject;
  }

  getPendingInvitationsFromDb(): Observable<Array<InvitationDB>> {
    return new Observable<Array<InvitationDB>>(observer => {
      this.getDatabase()
        .subscribe(
          (db) => {
            const transaction = db.transaction([this.TABLE_NAME], 'readonly');
            transaction.onerror = (error) => {
              console.error('indexedDB transaction error during getQueuedRequests', error);
            };

            const requests: Array<InvitationDB> = [];
            const openCursorRequest: IDBRequest = transaction.objectStore(this.TABLE_NAME).openCursor();
            openCursorRequest.onsuccess = (event) => {
              const cursor: IDBCursorWithValue = (<IDBRequest> event.target).result;
              if (cursor) {
                const now = new Date();
                if (new Date(cursor.value.validUntil) <= now) {
                  this.removeInvitationFromDB(cursor.value.id)
                    .take(1)
                    .subscribe();
                } else if (cursor.value.owner === this.authService.getSessionUser().userId) {
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

  addInvitationToDb(request: Invitation, token: string): Observable<InvitationDB> {
    return new Observable((observer) => {
      if (!request.id) {
        observer.error('No Id set!');
        return;
      }
      this.getDatabase()
        .subscribe(
          (db) => {
            const transaction = db.transaction([this.TABLE_NAME], 'readwrite');
            transaction.onerror = (error) => {
              console.error('indexedDB transaction error during addUserToDb', error);
            };
            const wrapper: InvitationDB = request as InvitationDB;
            wrapper.owner = this.authService.getSessionUser().userId;
            wrapper.token = token;

            const addRequest = transaction.objectStore(this.TABLE_NAME).add(wrapper);
            addRequest.onsuccess = (success: any) => {
              request.id = success.currentTarget.result;
              observer.next(wrapper); // return the user of the created row
              observer.complete();
            };
            addRequest.onerror = (error) => {
              console.error('indexedDB transaction error during addUserToDb', error);
              observer.error(error);
            };
          },
          (error) => {
            console.error('addUserToDb failed', error);
          }
        );
    });
  }

  removeInvitationFromDB(connectionId: string): Observable<void> {
    return this.getDatabase()
      .map(
        (db) => {
          const transaction = db.transaction([this.TABLE_NAME], 'readwrite');
          transaction.onerror = (error) => {
            console.error('indexedDB transaction error during removeFromQueue', error);
          };
          const getInvitation = transaction.objectStore(this.TABLE_NAME).get(connectionId);
          getInvitation.onsuccess = (event) => {
            const cursor: InvitationDB = (<IDBRequest> event.target).result;
            if (cursor) {
              if (cursor.owner === this.authService.getSessionUser().userId) {
                const addRequest = transaction.objectStore(this.TABLE_NAME).delete(connectionId);
                addRequest.onerror = (error) => {
                  console.error('indexedDB transaction error during removeFromQueue', error);
                };
              }
            }
          };
        }, (error) => {
          console.error('removeFromQueue failed', error);
        });
  }

  resetPendingInvitationsSubject() {
    ContactService._pendingInvitationsList.length = 0;
  }

  pushItemsToPendingInvitationsSubject(invitations: InvitationDB[]) {
    let resultList: InvitationDB[];
    resultList = _.concat(ContactService._pendingInvitationsList, invitations);
    ContactService._pendingInvitationsList = resultList;
    ContactService.pendingInvitationsSubject.next(resultList);
  }

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

  private confirmInvitation(id: string, invitation: Invitation): Observable<Invitation> {
    const safeUrl = urlTemplate.parse(this.config.identityApiHost + '/api/v1/invitations/{id}').expand({
      id
    });
    return this.http.post<Invitation>(safeUrl, invitation);
  }

  private getConfirmation(id: string): Observable<Invitation> {
    const safeUrl = urlTemplate.parse(this.config.identityApiHost + '/api/v1/invitations/{id}').expand({
      id
    });
    return this.http.get<Invitation>(safeUrl);
  }

  private addContact(id: string, contact: Contact): Observable<ContactDecrypted> {
    const safeUrl = urlTemplate.parse(this.config.identityApiHost + '/api/v1/invitations/{id}').expand({
      id
    });
    return this.http.put<Contact>(safeUrl, contact)
      .switchMap((createdContact: Contact) => {
        return this.cryptoItemService.decryptContact(createdContact, this.authService.getSessionUser().userId).do(decryptedContact => {
          this.cacheService.getContactsMap().set(decryptedContact.contactInfo.userId, decryptedContact);
        });
      });
  }

  private getMyContactInfo(): ContactInfo {
    const me = this.authService.getSessionUser();
    const info = new ContactInfo();
    info.email = me.user.email;
    info.firstname = me.user.firstName;
    info.lastname = me.user.lastName;
    info.userId = me.userId;
    info.phone = me.user.phone;
    return info;
  }
}
