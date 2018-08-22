import {Injectable} from '@angular/core';
import {ActivatedRoute, ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot} from '@angular/router';
import {AuthService} from '../auth.service';
import {Observable} from 'rxjs/Observable';
import {HOME_URL} from '../../../app.config';
import {UserSignUpState} from '../../user/user-sign-up-state.enum';
import {CryptoService} from '../../crypto/crypto.service';

/**
 * Guard to redirect to authentication area if already authenticated. E.g. for login page.
 */
@Injectable()
export class RedirectAuthGuard implements CanActivate {

  constructor(private auth: AuthService, private router: Router, private route: ActivatedRoute, private cryptoService: CryptoService) {
  }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean {
    if (this.auth.hasUserState(UserSignUpState.ACTIVATED) && this.checkKeystore()) {
      this.router.navigate([HOME_URL]);
      return true;
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
