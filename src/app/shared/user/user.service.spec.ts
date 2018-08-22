import {async, fakeAsync, flushMicrotasks, TestBed} from '@angular/core/testing';
import {testAuthConfig} from '../../../test-common/test-data';
import {Router} from '@angular/router';
import {NgbModule} from '@ng-bootstrap/ng-bootstrap';
import {SharedModule} from '../shared.module';
import {UserService} from './user.service';
import {AuthService} from '../auth/auth.service';
import {CryptoService} from '../crypto/crypto.service';
import {HttpClientTestingModule, HttpTestingController} from '@angular/common/http/testing';
import {Identity} from './enrollment';
import {HttpClient, HttpClientModule} from '@angular/common/http';
import * as uuidv1 from 'uuid/v1';
import { ENV_SETTING_TEST, ENV_SETTING_TEST_PROVIDER } from '../../settings-loader.spec';
import {RouterTestingModule} from '@angular/router/testing';

describe('UserService', () => {
  let userService: UserService;
  let authService: AuthService;
  let cryptoService: CryptoService;
  let httpMock: HttpTestingController;
  let http: HttpClient;
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

    userService = TestBed.get(UserService);
    authService = TestBed.get(AuthService);
    cryptoService = TestBed.get(CryptoService);
    httpMock = TestBed.get(HttpTestingController);
    http = TestBed.get(HttpClient);
  });

  afterEach(function () {
    window.sessionStorage.clear();
  });

  describe('enroll', () => {
    // it('should enroll user with correct credentials and return keystore',
    //   (done: DoneFn) => {
    //     const sessionUser = testAuthConfig.sessionUser;
    //     cryptoService.generateKeypairs()
    //       .then(value => {
    //
    //         return userService.enrollUser(sessionUser, 'asdfasdf');
    //       })
    //       .then((keystore: string) => {
    //
    //         expect(keystore).toBeDefined();
    //         expect(keystore.length).toBeGreaterThan(0);
    //         sessionUser.keyStore = keystore;
    //         return keystore;
    //       })
    //       .then(value => {
    //         return userService.addUserToDb(sessionUser).toPromise();
    //       })
    //       .then(value1 => {
    //         expect(value1).toBeDefined();
    //         return userService.requestNewActivationCode(value1, 'new@email').toPromise();
    //       })
    //       .then(value2 => {
    //         expect(value2).toBeDefined();
    //         expect(value2.user.email).toBe('new@email');
    //         return userService.confirmIdentity(value2, testAuthConfig.DEFAULT_PWD.toUpperCase()).toPromise();
    //       })
    //       .then((value3: SessionUser) => {
    //         expect(value3.signUpState).toBe(UserSignUpState.ACTIVATED);
    //         done();
    //       });
    //   });

    it('should enroll user with correct credentials and return keystore', fakeAsync(() => {
      const sessionUser = testAuthConfig.sessionUser;
      let keys;
      cryptoService.generateKeypairs()
        .then(value => {
          value.authenticationKey.kid = uuidv1();
          value.signatureKey.kid = uuidv1();
          value.contentKey.kid = uuidv1();
          keys = value;
          userService.enrollUser(sessionUser, 'tetete')
            .then(keystore => {
              expect(keystore).toBeDefined();
              expect(keystore.length).toBeGreaterThan(0);
              sessionUser.keyStore = keystore;
            });
          const request = httpMock.expectOne(ENV_SETTING_TEST.identityApiHost + '/api/v1/enrollment/create');
          request.flush({
            id: '1',
            authenticationKey: JSON.stringify(keys.authenticationKey),
            contentKey: JSON.stringify(keys.contentKey),
            signatureKey: JSON.stringify(keys.signatureKey),
            profileBlob: 'any'
          }as Identity);
        })
        .catch(reason => {
          fail(reason);
        });
      flushMicrotasks();
    }));


    afterEach(() => {
      httpMock.verify();
    });
  });


});

