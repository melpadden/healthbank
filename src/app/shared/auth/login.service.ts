import {Inject, Injectable} from '@angular/core';
import * as jwtDecode from 'jwt-decode';
import {HttpClient, HttpErrorResponse} from '@angular/common/http';
import {getJwtToken, getUser} from './auth-helper';
import {Params, Router} from '@angular/router';
import 'rxjs/add/observable/throw';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/toPromise';
import {ToastService} from '../toast/toast.service';
import {APP_AUTH_CONFIG} from './auth.config';
import {JwtData, Session} from './session/session.model';
import {Permission} from './session/permission.enum';
import {HOME_URL, LANDING_URL} from '../../app.config';
import {SessionUser} from '../user/user-session';
import {UserSignUpState} from '../user/user-sign-up-state.enum';
import {CryptoService} from '../crypto/crypto.service';
import * as _ from 'lodash';
import {CacheService} from '../cache/cache.service';
import {TimeLineItem} from '../timeline/models/timeline';
import {ENV_SETTINGS_TOKEN, EnvSettings} from '../../settings-loader';
import {Identity} from '../user/enrollment';
import {UserService} from '../user/user.service';
import {AuthService} from './auth.service';


export interface LoginRequest {
  challenge: any;
  cookie: string;
  proof: string;
}

export interface LoginResponse {
  token: string;
  identity: Identity;
}

@Injectable()
export class LoginService {
  constructor(private http: HttpClient,
              @Inject(ENV_SETTINGS_TOKEN) private config: EnvSettings,
              private authService: AuthService,
              private router: Router,
              private cacheService: CacheService,
              private cryptoService: CryptoService,
              private userService: UserService,
              private toast: ToastService) {
  }

  /**
   * Method logs user in, saves the JWT and when successfully broadcasts the event AuthEventType.LOGIN_SUCCESS
   */
  // TODO adapt for loginChallenge
  login(sessionUser: SessionUser, params?: Params): Promise<LoginResponse> {
    this.cacheService.invalidateAllCaches();
    const keyId = this.cryptoService.getAuthenticationKeyId();
    return this.http.get<LoginRequest>(this.config.identityApiHost + `/api/v1/auth/login/${keyId}`).toPromise()
      .then((challengeResult: LoginRequest) => {
        return this.cryptoService.createAuthenticationToken(challengeResult);
      })
      .then(value => {
        return this.http.post<LoginResponse>(this.config.identityApiHost + `/api/v1/auth/login/${keyId}`, value).toPromise();
      })
      .then((result: LoginResponse) => {
        try { // for parse errors, no token validation
          jwtDecode(result.token);
        } catch (err) {
          throw new HttpErrorResponse({
            statusText: 'Bad response: ' + err.message,
            status: 400,
            error: 'TokenDecodeError'
          });
        }
        window.sessionStorage.setItem(APP_AUTH_CONFIG.tokenName, result.token);
        return this.userService.updateUserFromIdentity(result.identity, sessionUser)
          .toPromise()
          .then(su => {
            window.sessionStorage.setItem(APP_AUTH_CONFIG.sessionUserTokenName, JSON.stringify(su));
            console.log('Successful login');
            if (params) {
              this.router.navigate([params['redirect'] ? params['redirect'] : HOME_URL], {queryParams: _.omit(params, 'redirect')});
            }
            return result;
          });

      })
      .catch(
        (errResponse: HttpErrorResponse) => {
          console.error('Auth service error on login: ', errResponse);
          if (errResponse.error === 'TokenDecodeError') {
            this.toast.error('login.toast.error.jwt.message', 'login.toast.error.jwt.title');
          } else if (errResponse.status === 401) {
            this.toast.error('login.toast.error.pwd.message', 'login.toast.error.pwd.title');
          } else if (String(errResponse.status)[0] !== '5') {
            this.toast.error('login.toast.error.technical.message', 'login.toast.error.technical.title');
          }
          throw errResponse;
        });
  }

  /**
   * Logs the user out by deleting the saved JWT token the keystore and the sessionUser.
   * Redirects to the landing page.
   */
  logout(): void {
    window.sessionStorage.removeItem(APP_AUTH_CONFIG.tokenName);
    window.sessionStorage.removeItem(APP_AUTH_CONFIG.sessionUserTokenName);
    this.cacheService.invalidateAllCaches();
    this.cryptoService.clearKeystore();
    this.router.navigate([LANDING_URL]);
  }

  reLogin(params?: Params): void {
    window.sessionStorage.removeItem(APP_AUTH_CONFIG.tokenName);
    this.cacheService.invalidateAllCaches();
    this.router.navigate([LANDING_URL], params ? {queryParams: params} : undefined);
  }

  /**
   * Removes the user from the session storage
   */
  logoutSessionUser() {
    this.authService.removeSessionUser();
    this.router.navigate([LANDING_URL]);
  }
}
