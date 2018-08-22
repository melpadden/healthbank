import {fakeAsync, flushMicrotasks, TestBed} from '@angular/core/testing';
import {NgbModule} from '@ng-bootstrap/ng-bootstrap';
import {HttpClientTestingModule, HttpTestingController} from '@angular/common/http/testing';
import {HttpClient, HttpClientModule} from '@angular/common/http';
import {AuthService} from '../../auth/auth.service';
import {SharedModule} from '../../shared.module';
import {ENV_SETTING_TEST, ENV_SETTING_TEST_PROVIDER} from '../../../settings-loader.spec';
import {IdentityService} from './identity.service';
import {CacheService} from '../../cache/cache.service';
import {testAuthConfig} from '../../../../test-common/test-data';
import {ContactDecrypted, InvitationDB} from '../models/contact';
import {CryptoItemService} from '../../crypto/crypto-item.service';
import {Observable} from 'rxjs/Observable';
import {Identity} from '../../user/enrollment';
import {ContactService} from './contact.service';
import {toDateTime} from '../../date/date.type';
import {RouterTestingModule} from '@angular/router/testing';

describe('IdentityService', () => {
  let identityService: IdentityService;
  let authService: AuthService;
  let cacheService: CacheService;
  let httpMock: HttpTestingController;
  let http: HttpClient;
  let cryptoItemService: CryptoItemService;
  let contactService: ContactService;
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        NgbModule.forRoot(),
        SharedModule,
        HttpClientModule,
        HttpClientTestingModule,
        RouterTestingModule,
      ],
      providers: [
        ENV_SETTING_TEST_PROVIDER,
      ]
    });

    identityService = TestBed.get(IdentityService);
    cryptoItemService = TestBed.get(CryptoItemService);
    contactService = TestBed.get(ContactService);
    authService = TestBed.get(AuthService);
    cacheService = TestBed.get(CacheService);
    httpMock = TestBed.get(HttpTestingController);
    http = TestBed.get(HttpClient);
    spyOn(authService, 'getSessionUser').and.returnValue(testAuthConfig.sessionUser);
    cacheService.resetContacts();
  });

  afterEach(function () {
    cacheService.resetContacts();
    window.sessionStorage.clear();
  });


  it('should remove contact and publish to subject', fakeAsync(() => {
    const other = {
      userId: 'me',
      contactInfo: {userId: 'other', firstname: 'firstname', lastname: 'lastname', email: 'email@other', phone: '+123456789'},
      invitationId: 'invitation',
      shared: {itemsSharedWithContact: 1, itemsSharedWithMe: 1},
    };
    cacheService.getContactsMap().set('other', other);
    cacheService.setContactsLoadedNow();
    identityService.emitContactsToSubject().subscribe();
    expect(identityService.getContactsSubject().getValue()).toEqual([other]);
    identityService.removeContact('invitation', 'other').subscribe(() => {
      expect(cacheService.getContactsMap().size).toBe(0);
      expect(identityService.getContactsSubject().getValue()).toBe([]);
    });
    httpMock.expectOne(ENV_SETTING_TEST.identityApiHost + '/api/v1/identity/invitation/contacts');
    flushMicrotasks();
  }));

  it('should get contacts from cache', fakeAsync(() => {
    const other = {
      userId: 'me',
      contactInfo: {userId: 'other', firstname: 'firstname', lastname: 'lastname', email: 'email@other', phone: '+123456789'},
      invitationId: 'invitation',
      shared: {itemsSharedWithContact: 1, itemsSharedWithMe: 1},
    };
    cacheService.getContactsMap().set('other', other);
    cacheService.setContactsLoadedNow();
    identityService.getContactsFromCache().subscribe(value => {
      expect(value).toEqual([other]);
    });

    httpMock.expectNone(ENV_SETTING_TEST.identityApiHost + '/api/v1/identity/32ab9fe1-9efe-4487-ad8b-d3c5f27f9e60/contacts');
    flushMicrotasks();
  }));

  it('should get contacts from backend when cache is not stale', fakeAsync(() => {
    const other = {
      userId: 'me',
      contactInfo: {userId: 'other', firstname: 'firstname', lastname: 'lastname', email: 'email@other', phone: '+123456789'},
      invitationId: 'invitation',
      shared: {itemsSharedWithContact: 1, itemsSharedWithMe: 1},
      users: {'32ab9fe1-9efe-4487-ad8b-d3c5f27f9e60': {key: 'sfd'}}
    } as ContactDecrypted;
    spyOn(cryptoItemService, 'decryptContact').and.returnValue(Observable.of(other));
    // cacheService.getContactsMap().set('other', other);
    identityService.getContactsFromCache().subscribe(value => {
      expect(value).toEqual([other]);
      expect(cacheService.isContactsCacheStale()).toBeTruthy();
      expect(cacheService.getContactsMap().size).toBe(1);
    });

    const requestContacts =
      httpMock.expectOne(ENV_SETTING_TEST.identityApiHost + '/api/v1/identity/32ab9fe1-9efe-4487-ad8b-d3c5f27f9e60/contacts');
    requestContacts.flush([other]);
    const requestSharedInformation =
      httpMock.expectOne(ENV_SETTING_TEST.identityApiHost + '/api/v1/timeline/32ab9fe1-9efe-4487-ad8b-d3c5f27f9e60/sharedInformation');
    requestSharedInformation.flush({
      ['32ab9fe1-9efe-4487-ad8b-d3c5f27f9e60']: {
        itemsSharedWithMe: 1,
        itemsSharedWithContact: 1
      }
    });
    flushMicrotasks();
  }));

  it('should emit contacts to subject', fakeAsync(() => {
    const other = {
      userId: 'me',
      contactInfo: {userId: 'other', firstname: 'firstname', lastname: 'lastname', email: 'email@other', phone: '+123456789'},
      invitationId: 'invitation',
      shared: {itemsSharedWithContact: 1, itemsSharedWithMe: 1},
    };
    cacheService.getContactsMap().set('other', other);
    cacheService.setContactsLoadedNow();
    identityService.emitContactsToSubject().subscribe(value => {
      expect(value).toEqual([other]);
      expect(identityService.getContactsSubject().getValue()).toEqual([other]);
    });

    httpMock.expectNone(ENV_SETTING_TEST.identityApiHost + '/api/v1/identity/32ab9fe1-9efe-4487-ad8b-d3c5f27f9e60/contacts');
    flushMicrotasks();
  }));

  it('should get identity from cache', fakeAsync(() => {
    const identity = {
      id: 'me',
      contentKey: 'contentKey',
      signatureKey: 'signatureKey',
      authenticationKey: 'authKey',
      profileBlob: 'Blob',
    } as Identity;

    cacheService.getIdentitiesMap().set('other', identity);
    expect(cacheService.getIdentitiesMap().size).toEqual(1);
    identityService.getIdentityFromCache('other').subscribe(value => {
      expect(value).toEqual(identity);
    });

    httpMock.expectNone(ENV_SETTING_TEST.identityApiHost + '/api/v1/identity/other');
    flushMicrotasks();
  }));

  it('should try to get identity from BE if not in cache', fakeAsync(() => {
    const identity = {
      id: 'me',
      contentKey: 'contentKey',
      signatureKey: 'signatureKey',
      authenticationKey: 'authKey',
      profileBlob: 'Blob',
    } as Identity;

    cacheService.getIdentitiesMap().set('other', identity);
    expect(cacheService.getIdentitiesMap().size).toEqual(1);
    identityService.getIdentityFromCache('me').subscribe(value => {
      expect(value).toEqual(identity);
      expect(cacheService.getIdentitiesMap().get('me')).toEqual(identity);
    });

    const request = httpMock.expectOne(ENV_SETTING_TEST.identityApiHost + '/api/v1/identity/me');
    request.flush(identity);
    flushMicrotasks();
  }));

  it('should add identity to cache on retrieved identity from BE', fakeAsync(() => {
    cacheService.resetContactsLoaded();
    const identity = {
      id: 'me',
      contentKey: 'contentKey',
      signatureKey: 'signatureKey',
      authenticationKey: 'authKey',
      profileBlob: 'Blob',
    } as Identity;

    expect(cacheService.getIdentitiesMap().size).toEqual(0);
    identityService.getOne('me').subscribe(value => {
      expect(value).toEqual(identity);
      expect(cacheService.getIdentitiesMap().get('me')).toEqual(identity);
    });

    const request = httpMock.expectOne(ENV_SETTING_TEST.identityApiHost + '/api/v1/identity/me');
    request.flush(identity);
    flushMicrotasks();
  }));

  it('should get contact from cache and do not push to subject', fakeAsync(() => {
    cacheService.resetContacts();
    const other = {
      userId: 'me',
      contactInfo: {userId: 'other', firstname: 'firstname', lastname: 'lastname', email: 'email@other', phone: '+123456789'},
      invitationId: 'invitation',
      shared: {itemsSharedWithContact: 1, itemsSharedWithMe: 1},
    };
    cacheService.getContactsMap().set('other', other);
    cacheService.setContactsLoadedNow();
    identityService.getContactFromCache('other').subscribe(value => {
      expect(value).toEqual(other);
      expect(identityService.getContactsSubject().getValue()).toEqual([other]);
    });

    httpMock.expectNone(ENV_SETTING_TEST.identityApiHost + '/api/v1/identity/32ab9fe1-9efe-4487-ad8b-d3c5f27f9e60/contacts');
    flushMicrotasks();
  }));

  it('should get contact from backend when cache is not stale', fakeAsync(() => {
    cacheService.resetContactsLoaded();
    const other = {
      userId: 'me',
      contactInfo: {userId: 'other', firstname: 'firstname', lastname: 'lastname', email: 'email@other', phone: '+123456789'},
      invitationId: 'invitation',
      shared: {itemsSharedWithContact: 1, itemsSharedWithMe: 1},
      users: {'32ab9fe1-9efe-4487-ad8b-d3c5f27f9e60': {key: 'sfd'}}
    } as ContactDecrypted;
    spyOn(cryptoItemService, 'decryptContact').and.returnValue(Observable.of(other));
    // cacheService.getContactsMap().set('other', other);
    identityService.getContactFromCache('other').subscribe(value => {
      expect(value).toEqual(other);
      expect(cacheService.isContactsCacheStale()).toBeTruthy();
      expect(cacheService.getContactsMap().size).toBe(1);
      expect(identityService.getContactsSubject().getValue()).toEqual([other]);
    });

    const requestContacts =
      httpMock.expectOne(ENV_SETTING_TEST.identityApiHost + '/api/v1/identity/32ab9fe1-9efe-4487-ad8b-d3c5f27f9e60/contacts');
    requestContacts.flush([other]);
    const requestSharedInformation =
      httpMock.expectOne(ENV_SETTING_TEST.timelineApiHost + '/api/v1/timeline/32ab9fe1-9efe-4487-ad8b-d3c5f27f9e60/sharedInformation');
    requestSharedInformation.flush({
      ['32ab9fe1-9efe-4487-ad8b-d3c5f27f9e60']: {
        itemsSharedWithMe: 1,
        itemsSharedWithContact: 1
      }
    });
    flushMicrotasks();
  }));

  it('should load contacts from cache add pending contacts', fakeAsync(() => {
    const contact1 = {
      userId: 'me',
      contactInfo: {userId: 'other1', firstname: 'firstname', lastname: 'lastname', email: 'email@other', phone: '+123456789'},
      invitationId: 'invitation',
      shared: {itemsSharedWithContact: 1, itemsSharedWithMe: 1},
    };

    const contactInvited = {
      userId: 'me',
      contactInfo: {userId: 'other2', firstname: 'firstname', lastname: 'lastname', email: 'email@other', phone: '+123456789'},
      invitationId: 'invitation',
      shared: {itemsSharedWithContact: 1, itemsSharedWithMe: 1},
    };

    const invitation = {
      id: 'invitation1',
      token: 'token',
      owner: 'other2',
      validUntil: toDateTime(new Date(new Date().getTime() + 1)),
      transientContactInfo: 'info'
    } as InvitationDB;
    const getPeningInvitationsSpy = spyOn(contactService, 'getPendingInvitationsFromDb').and.returnValue(Observable.of([invitation]));
    const checkAcceptedSpy = spyOn(contactService, 'checkAccepted').and.callFake(() => {
      cacheService.getContactsMap().set('other2', contactInvited);
      return Observable.of(contactInvited);
    });
    const removeInvitationSpy = spyOn(contactService, 'removeInvitationFromDB').and.returnValue(Observable.empty());
    cacheService.getContactsMap().set('other1', contact1);
    cacheService.setContactsLoadedNow();
    identityService.loadContactsSubject();
    expect(identityService.getContactsSubject().getValue()).toEqual([contact1, contactInvited]);
    expect(getPeningInvitationsSpy).toHaveBeenCalledTimes(2);
    expect(checkAcceptedSpy).toHaveBeenCalledTimes(1);
    expect(removeInvitationSpy).toHaveBeenCalledTimes(1);

    flushMicrotasks();
  }));


  afterEach(() => {
    httpMock.verify();
  });


});

