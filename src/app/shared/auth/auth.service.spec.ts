import {async, TestBed} from '@angular/core/testing';
import {AuthService} from './auth.service';
import {enrollUser, testAuthConfig} from '../../../test-common/test-data';
import {APP_AUTH_CONFIG} from './auth.config';
import {Router} from '@angular/router';
import {NgbModule} from '@ng-bootstrap/ng-bootstrap';
import {SharedModule} from '../shared.module';
import {UserService} from '../user/user.service';
import {CryptoService} from '../crypto/crypto.service';
import {SessionUser} from '../user/user-session';
import {ENV_SETTING_TEST_PROVIDER} from '../../settings-loader.spec';
import {RouterTestingModule} from '@angular/router/testing';

describe('AuthService', () => {
  let authService: AuthService;
  let cryptoService: CryptoService;
  let userService: UserService;
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        NgbModule.forRoot(),
        SharedModule,
        RouterTestingModule,
      ],
      providers: [
        ENV_SETTING_TEST_PROVIDER
      ]
    });
    authService = TestBed.get(AuthService);
    cryptoService = TestBed.get(CryptoService);
    userService = TestBed.get(UserService);
  }));

  beforeEach((done: DoneFn) => {
    cryptoService = TestBed.get(CryptoService);
    const user = testAuthConfig.preparedUserForEnrollment;
    user.email = Math.random().toString() + '@' + Math.random().toString();
    const sessionUser = new SessionUser(user, undefined);
    enrollUser(userService, cryptoService, sessionUser)
      .then((createdUser: SessionUser) => {
        window.sessionStorage.setItem(testAuthConfig.testSessionUser, JSON.stringify(createdUser));
        done();
      })
      .catch(done.fail);
  });

  afterEach(function () {
    window.sessionStorage.clear();
  });

  describe('isAuthenticated', () => {
    it('should return true if a token is present', () => {
      window.sessionStorage.setItem(APP_AUTH_CONFIG.tokenName, testAuthConfig.EXPIRED_TOKEN);
      expect(authService.isAuthenticated()).toBe(true);
    });

    it('should return false if there is no token', () => {
      expect(authService.isAuthenticated()).toBe(false);
    });
  });

  describe('getSession', () => {
    it('should retrieve the session object', () => {
      window.sessionStorage.setItem(APP_AUTH_CONFIG.sessionUserTokenName, JSON.stringify(testAuthConfig.sessionUser));

      const session = authService.getSessionUser();
      expect(session).toBeDefined();
      expect(session instanceof SessionUser).toBe(true);
      expect(session.user.email).toBe('user@demo');
    });

    it('should return null if no token is present', () => {
      expect(authService.getSessionUser()).toBe(null);
    });

    it('should return null, if the token cannot be parsed', () => {
      window.sessionStorage.setItem(APP_AUTH_CONFIG.sessionUserTokenName, 'garbage');
      expect(authService.getSession()).toBe(null);
    });
  });

});
