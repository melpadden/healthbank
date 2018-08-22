import {fakeAsync, flushMicrotasks, TestBed, tick} from '@angular/core/testing';
import {NgbModule} from '@ng-bootstrap/ng-bootstrap';
import {HttpClientTestingModule, HttpTestingController} from '@angular/common/http/testing';
import {HttpClient, HttpClientModule} from '@angular/common/http';
import {AuthService} from '../../auth/auth.service';
import {SharedModule} from '../../shared.module';
import {ENV_SETTING_TEST, ENV_SETTING_TEST_PROVIDER} from '../../../settings-loader.spec';
import {IdentityService} from './identity.service';
import {CacheService} from '../../cache/cache.service';
import {testAuthConfig} from '../../../../test-common/test-data';
import {Observable} from 'rxjs/Observable';
import {ContactService} from './contact.service';
import {CryptoService} from '../../crypto/crypto.service';
import {Invitation, InvitationDB} from '../models/contact';
import {toDateTime} from '../../date/date.type';
import {CryptoItemService} from '../../crypto/crypto-item.service';
import {RouterTestingModule} from '@angular/router/testing';

describe('ContactService', () => {
  let identityService: IdentityService;
  let authService: AuthService;
  let cacheService: CacheService;
  let httpMock: HttpTestingController;
  let http: HttpClient;
  let cryptoItemService: CryptoItemService;
  let contactService: ContactService;
  let cryptoService: CryptoService;
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
    cryptoService = TestBed.get(CryptoService);
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


  it('should create an invitation', fakeAsync(() => {
    const data = new Map();
    data.set('data', 'data');

    spyOn(cryptoService, 'encryptTokenKey').and.returnValue(Promise.resolve([data, 'token', 'invitationId']));
    spyOn(contactService, 'addInvitationToDb').and.returnValue(Observable.of('token'));
    contactService.createInvitation().subscribe(value => {
      expect(value).toEqual('token');
    }, error2 => {
      fail(error2);
    });
    flushMicrotasks();
    httpMock.expectOne(ENV_SETTING_TEST.identityApiHost + '/api/v1/invitations');
  }));

  it('should accept an invitation and add the contact to contact list', fakeAsync(() => {
    cacheService.resetContacts();
    const other = {
      userId: 'me',
      contactInfo: {userId: 'other', firstname: 'firstname', lastname: 'lastname', email: 'email@other', phone: '+123456789'},
      invitationId: 'invitationId',
      shared: {itemsSharedWithContact: 1, itemsSharedWithMe: 1},
    };

    const invitation: Invitation = {
      id: 'invitationId',
      transientContactInfo: 'transientContactInfo',
      validUntil: toDateTime(new Date(new Date().getTime() + 1)),
    };

    const data = new Map();
    data.set('data', 'data');
    spyOn(cryptoService, 'encryptTokenKey').and.returnValue(Promise.resolve([data, 'token', 'invitationId']));
    spyOn(cryptoService, 'decryptTokenKey').and.returnValue(Observable.of(data));
    spyOn(cryptoService, 'encrypt').and.returnValue(Observable.of(['otherKey', data]));
    spyOn(cryptoItemService, 'decryptContact').and.returnValue(Observable.of(other));
    spyOn(contactService, 'addInvitationToDb').and.returnValue(Observable.of('token'));
    contactService.acceptInvitation('token').subscribe(value => {
      expect(value).toEqual(other);
      expect(cacheService.getContactsMap().has(other.contactInfo.userId)).toBeTruthy();
    }, error2 => {
      fail(error2);
    });
    flushMicrotasks();
    const confirmRequest =
      httpMock.expectOne({method: 'POST', url: ENV_SETTING_TEST.identityApiHost + '/api/v1/invitations/invitationId'});
    confirmRequest.flush(invitation);
    const addContactRequest =
      httpMock.expectOne({method: 'PUT', url: ENV_SETTING_TEST.identityApiHost + '/api/v1/invitations/invitationId'});
    addContactRequest.flush(other);
  }));

  it('should check if an invitation was accepted and add the contact to contactList', fakeAsync(() => {
    cacheService.resetContacts();
    const other = {
      userId: 'me',
      contactInfo: {userId: 'other', firstname: 'firstname', lastname: 'lastname', email: 'email@other', phone: '+123456789'},
      invitationId: 'invitationId',
      shared: {itemsSharedWithContact: 1, itemsSharedWithMe: 1},
    };

    const invitation: Invitation = {
      id: 'invitationId',
      transientContactInfo: 'transientContactInfo',
      validUntil: toDateTime(new Date(new Date().getTime() + 1)),
    };

    const data = new Map();
    data.set('contact', 'contactData');
    spyOn(cryptoService, 'decryptTokenKey').and.returnValue(Observable.of(data));
    spyOn(cryptoService, 'encrypt').and.returnValue(Observable.of(['otherKey', data]));
    spyOn(cryptoItemService, 'decryptContact').and.returnValue(Observable.of(other));
    contactService.checkAccepted('invitationId', 'token').subscribe(value => {
      expect(value).toEqual(other);
      expect(cacheService.getContactsMap().has(other.contactInfo.userId)).toBeTruthy();
    }, error2 => {
      fail(error2);
    });
    flushMicrotasks();
    const confirmRequest =
      httpMock.expectOne({method: 'GET', url: ENV_SETTING_TEST.identityApiHost + '/api/v1/invitations/invitationId'});
    confirmRequest.flush(invitation);
    const addContactRequest =
      httpMock.expectOne({method: 'PUT', url: ENV_SETTING_TEST.identityApiHost + '/api/v1/invitations/invitationId'});
    addContactRequest.flush(other);
  }));

  it('should get pending invitations and push them to the subject', fakeAsync(() => {
    contactService.getPendingInvitationsSubject().next([]);
    expect(contactService.getPendingInvitationsSubject().getValue()).toEqual([]);
    const invitation: InvitationDB = {
      id: 'invitationId',
      transientContactInfo: 'transientContactInfo',
      validUntil: toDateTime(new Date(new Date().getTime() + 1)),
      owner: 'me',
      token: 'token'

    };

    const getPendingInvitationsFromDbSpy =
      spyOn(contactService, 'getPendingInvitationsFromDb').and.returnValue(Observable.of([invitation]));

    contactService.getPendingInvitations().subscribe(() => {
    }, error2 => {
      fail(error2);
    });
    tick(1000);
    expect(contactService.getPendingInvitationsSubject().getValue()).toEqual([invitation]);
    expect(getPendingInvitationsFromDbSpy).toHaveBeenCalledTimes(1);
    flushMicrotasks();

  }));

  it('should push pending invitations to the subject', fakeAsync(() => {

    const invitation: InvitationDB = {
      id: 'invitationId',
      transientContactInfo: 'transientContactInfo',
      validUntil: toDateTime(new Date(new Date().getTime() + 1)),
      owner: 'me',
      token: 'token'

    };
    contactService.pushItemsToPendingInvitationsSubject([invitation]);
    expect(contactService.getPendingInvitationsSubject().getValue()).toEqual([invitation]);

    const invitation1: InvitationDB = {
      id: 'invitationId1',
      transientContactInfo: 'transientContactInfo',
      validUntil: toDateTime(new Date(new Date().getTime() + 1)),
      owner: 'me',
      token: 'token'

    };

    contactService.pushItemsToPendingInvitationsSubject([invitation1]);
    expect(contactService.getPendingInvitationsSubject().getValue()).toContain(invitation, invitation1);
    expect(contactService.getPendingInvitationsSubject().getValue().length).toBe(2);

  }));

  afterEach(() => {
    contactService.resetPendingInvitationsSubject();
    httpMock.verify();
  });


});

