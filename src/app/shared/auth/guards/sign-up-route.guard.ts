import {Injectable} from '@angular/core';
import {ActivatedRouteSnapshot, CanActivateChild, RouterStateSnapshot} from '@angular/router';
import {AuthService} from '../auth.service';
import {SessionUser} from '../../user/user-session';
import {CryptoService} from '../../crypto/crypto.service';
import {LoginService} from '../login.service';

@Injectable()
export class SignUpRouteGuard implements CanActivateChild {

  constructor(private auth: AuthService, private loginService: LoginService, private cryptoService: CryptoService) {
  }

  canActivateChild(childRoute: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    const user: SessionUser = this.auth.getSessionUser();
    if (user && !user.signUpState) {
      this.auth.removeSessionUser();
    }
    if (user && !this.checkKeystore()) {
      this.loginService.reLogin();
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
