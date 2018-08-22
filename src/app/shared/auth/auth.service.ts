import {Injectable} from '@angular/core';
import * as jwtDecode from 'jwt-decode';
import {getJwtToken, getUser} from './auth-helper';
import 'rxjs/add/observable/throw';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/toPromise';
import {APP_AUTH_CONFIG} from './auth.config';
import {JwtData, Session} from './session/session.model';
import {Permission} from './session/permission.enum';
import {SessionUser} from '../user/user-session';
import {UserSignUpState} from '../user/user-sign-up-state.enum';
import {TimeLineItem} from '../timeline/models/timeline';


@Injectable()
export class AuthService {
  constructor() {
  }

  /**
   * Retrieves the current Session, if authenticated, or null
   */
  getSession(): Session {
    const jwtToken: string = getJwtToken();
    if (!jwtToken) {
      return null;
    }

    try {
      return Session.fromJWT(jwtDecode<JwtData>(jwtToken));
    } catch (ex) {
      console.error('Error creating Session object in getSession', ex);
      return null;
    }
  }

  /**
   * Checks if a token is available and the user _should_ be authenticated. It does not validated if the token is expired
   */
  isAuthenticated(): boolean {
    return !!getJwtToken();
  }

  /**
   * checks if the user has the required permission or _one_ of the required permissions.
   *
   * @param permissions one permission or a list of permission where the user should have one.
   */
  authorize(...permissions: Permission[]): boolean {
    const session: Session = this.getSession();

    if (session === null) {
      return false;
    }

    if (permissions.length === 0) {
      return true;
    }

    const userPerms: Permission[] = session.perm;

    return permissions.some((perm: Permission) => {
      return userPerms.indexOf(perm) !== -1;
    });
  }

// TODO remove this and all corresponding in case we do not have any permissions
  authorizeSessionUser(...permissions: Permission[]): boolean {
    return true;
  }

  removeSessionUser() {
    window.sessionStorage.removeItem(APP_AUTH_CONFIG.sessionUserTokenName);
  }

  /**
   * Retrieves the current Session, if authenticated, or null
   */
  getSessionUser(): SessionUser {
    const object = JSON.parse(getUser(APP_AUTH_CONFIG.sessionUserTokenName));
    if (!object) {
      return null;
    }
    const sessionUser: SessionUser = new SessionUser(object.user, object.signUpState);
    sessionUser.keyStore = object.keyStore;
    sessionUser.userId = object.userId;
    return sessionUser;
  }

  hasUserState(state: UserSignUpState): boolean {
    const user: SessionUser = JSON.parse(getUser(APP_AUTH_CONFIG.sessionUserTokenName));
    return user && user.signUpState === state;
  }

  isOwner(item: TimeLineItem) {
    if (item && item.owner === this.getSessionUser().userId) {
      return true;
    }
    return false;
  }
}
