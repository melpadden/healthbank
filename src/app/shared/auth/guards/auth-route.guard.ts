import {Injectable} from '@angular/core';
import {ActivatedRouteSnapshot, CanActivateChild, Params, Router, RouterStateSnapshot} from '@angular/router';
import {AuthService} from '../auth.service';
import {Observable} from 'rxjs/Observable';
import {UserSignUpState} from '../../user/user-sign-up-state.enum';
import {CryptoService} from '../../crypto/crypto.service';
import * as _ from 'lodash';
import {LoginService} from '../login.service';

@Injectable()
export class AuthRouteGuard implements CanActivateChild {

  constructor(private auth: AuthService, private loginService: LoginService, private router: Router, private cryptoService: CryptoService) {
  }

  canActivateChild(childRoute: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean {
    if (!this.auth.hasUserState(UserSignUpState.ACTIVATED)) {
      console.log('Redirecting to public landing page');
      this.router.navigateByUrl('/');
      return true;
    } else if (!this.checkKeystore()) {
      this.loginService.reLogin(_.extend({}, childRoute.queryParams,
        {redirect: state.url.indexOf('?') === -1 ? state.url : state.url.substring(0, state.url.indexOf('?'))}));
      return false;
    }

    return true;
  }

  checkKeystore(): boolean {
    try {
      this.cryptoService.exportPublicKeys();
      return true;
    } catch {
      return false;
    }
  }
}
