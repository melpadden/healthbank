import {Inject, Injectable, OnDestroy} from '@angular/core';
import {Observable} from 'rxjs/Observable';
import {HttpClient} from '@angular/common/http';
import {Contact, ContactDecrypted, InvitationDB, SharedInformation} from '../models/contact';
import * as urlTemplate from 'url-template';
import {BehaviorSubject} from 'rxjs/BehaviorSubject';
import {ContactService} from './contact.service';
import 'rxjs/add/observable/onErrorResumeNext';
import 'rxjs/add/operator/mergeMap';
import 'rxjs/add/observable/forkJoin';
import {HttpErrorService} from '../../app-http/http-error.service';
import {AuthService} from '../../auth/auth.service';
import {CryptoService} from '../../crypto/crypto.service';
import {Identity} from '../../user/enrollment';
import 'rxjs/add/operator/share';
import {CacheService} from '../../cache/cache.service';
import {Subject} from 'rxjs/Subject';
import 'rxjs/add/operator/do';
import 'rxjs/add/operator/switchMap';
import 'rxjs/add/operator/take';
import {ENV_SETTINGS_TOKEN, EnvSettings} from '../../../settings-loader';
import {CryptoItemService} from '../../crypto/crypto-item.service';
import 'rxjs/add/observable/empty';
import 'rxjs/add/observable/zip';
import 'rxjs/add/observable/combineLatest';
import 'rxjs/add/operator/catch';
import {getLocaleSupport} from '../../../core/utils/helper';
import {TranslateService} from '@ngx-translate/core';

/**
 * Identity Service.
 */
@Injectable()
export class IdentityService implements OnDestroy {

  private static contactsSubject$: BehaviorSubject<ContactDecrypted[]> = new BehaviorSubject<ContactDecrypted[]>([]);
  private ngUnsubscribe$: Subject<boolean> = new Subject<boolean>();

  constructor(private http: HttpClient,
              @Inject(ENV_SETTINGS_TOKEN) private config: EnvSettings,
              private errorService: HttpErrorService,
              private authService: AuthService,
              private cacheService: CacheService,
              private cryptoService: CryptoService,
              private contactService: ContactService,
              private cryptoItemService: CryptoItemService,
              private translate: TranslateService) {
  }

  ngOnDestroy() {
    this.ngUnsubscribe$.next(true);
    this.ngUnsubscribe$.complete();
  }

  getContactsSubject(): BehaviorSubject<ContactDecrypted[]> {
    return IdentityService.contactsSubject$;
  }

  loadContactsSubject(): void {
    this.contactService.resetPendingInvitationsSubject();
    this.contactService.pushItemsToPendingInvitationsSubject([]);
    this.getContactsFromCache()
      .take(1)
      .subscribe(() => {
        this.pushItemsToContactsSubject(Array.from(this.cacheService.getContactsMap().values()));
      }, error2 => {
      });

    this.contactService.getPendingInvitationsFromDb()
      .take(1)
      .switchMap((pendingInvitations: InvitationDB[]) => {
        if (pendingInvitations && pendingInvitations.length <= 0) {
          return;
        }
        return Observable.onErrorResumeNext(pendingInvitations.map((pendingInvitation: InvitationDB) => {
          return this.contactService.checkAccepted(pendingInvitation.id, pendingInvitation.token)
            .catch(err => {
              if (err && err.error && err.error.error === 'invitation__not_found') {
                this.contactService.removeInvitationFromDB(pendingInvitation.id).take(1).subscribe();
              }
              throw Error(err);
            })
            .switchMap(decryptedContact => {
              this.pushItemsToContactsSubject(Array.from(this.cacheService.getContactsMap().values()));
              return this.contactService.removeInvitationFromDB(pendingInvitation.id);
            });
        }));
      })
      .subscribe(() => {
        }, error2 => {
        }, () => {
          this.contactService.getPendingInvitations();
        }
      );
  }

  removeContact(invitationId: string, contactId: string): Observable<void> {
    const safeUrl = urlTemplate.parse(this.config.identityApiHost + '/api/v1/identity/{invitationId}/contacts')
      .expand({
        invitationId
      });
    return this.http.delete<void>(safeUrl).do(() => {
      this.cacheService.removeContactFromCache(contactId);
      this.pushItemsToContactsSubject(Array.from(this.cacheService.getContactsMap().values()));
    });
  }


  getContactsFromCache(): Observable<ContactDecrypted[]> {
    if (!this.cacheService.isContactsCacheStale()) {
      return this.getContacts();
    } else {
      return Observable.of(Array.from(this.cacheService.getContactsMap().values()));
    }
  }

  emitContactsToSubject(): Observable<ContactDecrypted[]> {
    return this.getContactsFromCache().do(value => {
      this.pushItemsToContactsSubject(value);
    });
  }

  getIdentityFromCache(userId): Observable<Identity> {
    if (this.cacheService.getIdentitiesMap().has(userId)) {
      return Observable.of(this.cacheService.getIdentitiesMap().get(userId));
    } else {
      return this.getOne(userId);
    }
  }

  getOne(id: string): Observable<Identity> {
    const safeUrl = urlTemplate.parse(this.config.identityApiHost + '/api/v1/identity/{id}').expand({
      id
    });
    return this.http.get<Identity>(safeUrl)
      .do(value => {
        this.cacheService.getIdentitiesMap().set(value.id, value);
      });
  }

  getContactFromCache(contactId: string): Observable<ContactDecrypted> {
    console.log(`Try to get contact with id ${contactId} from cache`);
    if (!this.cacheService.isContactsCacheStale()) {
      return this.getContacts()
        .map(value => {
          this.pushItemsToContactsSubject(value);
          return this.cacheService.getContactsMap().get(contactId);
        });
    } else {
      return Observable.of(this.cacheService.getContactsMap().get(contactId));
    }
  }

  getContactSharedInformations(contacts: string[], member: string): Observable<{ [index: string]: SharedInformation }> {
    const safeUrl = urlTemplate.parse(this.config.timelineApiHost + '/api/v1/timeline/{member}/sharedInformation').expand({
      member
    });
    return this.http.post<{ [index: string]: SharedInformation }>(safeUrl, contacts);
  }

  private pushItemsToContactsSubject(contacts: ContactDecrypted[]) {
    IdentityService.contactsSubject$.next(this.sortContacts(contacts));
  }

  private getContacts(): Observable<ContactDecrypted[]> {
    const id = this.authService.getSessionUser().userId;
    const safeUrl = urlTemplate.parse(this.config.identityApiHost + '/api/v1/identity/{id}/contacts').expand({
      id
    });
    return this.http.get<Contact[]>(safeUrl)
      .do(() => {
        this.cacheService.resetContacts();
        this.cacheService.setContactsLoadedNow();
      })
      .switchMap(value => {
        return Observable.forkJoin(value.map(item => {
          return this.cryptoItemService.decryptContact(item, this.authService.getSessionUser().userId);
        }));
      })
      .switchMap((decryptedCntacts: ContactDecrypted[]) => {
        const contactUuids = decryptedCntacts.map(c => c.contactInfo.userId);
        return this.getContactSharedInformations(contactUuids, id)
          .switchMap(value => {
            const mappedContacts = decryptedCntacts.map(contact => {
              contact.shared = value[contact.contactInfo.userId];
              this.cacheService.getContactsMap().set(contact.contactInfo.userId, contact);
              return contact;
            });
            this.pushItemsToContactsSubject(mappedContacts);
            return Observable.of(mappedContacts);
          });
      });
  }

  private sortContacts(contacts: ContactDecrypted[]): ContactDecrypted[] {
    const localeSupport = getLocaleSupport();
    contacts.sort((a: ContactDecrypted, b: ContactDecrypted): number => {
      if (localeSupport) {
        let compare = a.contactInfo.lastname.localeCompare(b.contactInfo.lastname, this.translate.currentLang, {caseFirst: 'upper'});
        if (compare === 0) {
          compare = a.contactInfo.firstname.localeCompare(b.contactInfo.firstname, this.translate.currentLang, {caseFirst: 'upper'});
        }
        return compare;
      } else {
        // fallback. Note: at least chrome and phantomjs sort casing different
        let compare = a.contactInfo.lastname.localeCompare(b.contactInfo.lastname);
        if (compare === 0) {
          compare = a.contactInfo.firstname.localeCompare(b.contactInfo.firstname);
        }
        return compare;
      }
    });
    return contacts;
  }
}
