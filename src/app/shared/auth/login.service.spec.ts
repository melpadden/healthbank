import {async, TestBed} from '@angular/core/testing';
import {AuthService} from './auth.service';
import {enrollUser, testAuthConfig} from '../../../test-common/test-data';
import {APP_AUTH_CONFIG} from './auth.config';
import {Router} from '@angular/router';
import {NgbModule} from '@ng-bootstrap/ng-bootstrap';
import {HOME_URL, LANDING_URL} from '../../app.config';
import {SharedModule} from '../shared.module';
import {UserService} from '../user/user.service';
import {CryptoService} from '../crypto/crypto.service';
import {SessionUser} from '../user/user-session';
import {ENV_SETTING_TEST_PROVIDER} from '../../settings-loader.spec';
import {Observable} from 'rxjs/Observable';
import {LoginResponse, LoginService} from './login.service';
import {RouterTestingModule} from '@angular/router/testing';

describe('LoginService', () => {
  let loginService: LoginService;
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
    loginService = TestBed.get(LoginService);
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

  describe('login', () => {
    it('should work with correct credentials', (done: DoneFn) => {
      const navSpy: jasmine.Spy = spyOn(TestBed.get(Router), 'navigate');
      const sessionUser: SessionUser = JSON.parse(window.sessionStorage.getItem(testAuthConfig.testSessionUser));
      spyOn(userService, 'updateUserFromIdentity').and.returnValue(Observable.of(sessionUser));
      loginService.login(sessionUser, {redirect: HOME_URL})
        .then((result: LoginResponse) => {
          expect(result).toBeDefined();
          expect(result.token.length).toBeGreaterThan(0);
          expect(navSpy).toHaveBeenCalledTimes(1);
          expect(navSpy).toHaveBeenCalledWith([HOME_URL], Object({queryParams: Object({})}));

          const jwtToken: string = window.sessionStorage.getItem(APP_AUTH_CONFIG.tokenName);

          expect(jwtToken).toBeDefined();

          expect(authService.isAuthenticated()).toBe(true);

          const session = authService.getSessionUser();
          expect(session).toBeDefined();
          expect(session.user.email).toBe(sessionUser.user.email);
          done();
        })
        .catch(done.fail);
    });

    it('should invoke catch on missing Keystore', () => {
      const navSpy: jasmine.Spy = spyOn(TestBed.get(Router), 'navigate');
      cryptoService.clearKeystore();
      const sessionUser: SessionUser = JSON.parse(window.sessionStorage.getItem(testAuthConfig.testSessionUser));
      sessionUser.keyStore = null;
      expect(function () {
        loginService.login(sessionUser);
      }).toThrow(new Error('Keystore not initialized.'));
    });

  });

  describe('logout', () => {
    it('should remove token from sessionStore', (done: DoneFn) => {
      const sessionUser: SessionUser = JSON.parse(window.sessionStorage.getItem(testAuthConfig.testSessionUser));
      loginService.login(sessionUser)
        .then(() => {
          const navSpy: jasmine.Spy = spyOn(TestBed.get(Router), 'navigate');
          loginService.logout();
          expect(window.sessionStorage.getItem(APP_AUTH_CONFIG.tokenName)).toBe(null);
          expect(window.sessionStorage.getItem(APP_AUTH_CONFIG.sessionUserTokenName)).toBe(null);

          expect(navSpy).toHaveBeenCalledTimes(1);
          expect(navSpy).toHaveBeenCalledWith([LANDING_URL]);
          done();
        }).catch(done.fail);
    });
  });

});
