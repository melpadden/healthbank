import {Component} from '@angular/core';
import { AuthService } from '../../../shared/auth/auth.service';
import { Permission } from '../../../shared/auth/session/permission.enum';
import { environment } from '../../../../environments/environment';
import { Router } from '@angular/router';
import {LoginService} from '../../../shared/auth/login.service';


@Component({
  selector: 'app-navigation',
  templateUrl: './navigation.component.html',
  styleUrls: ['./navigation.component.scss']
})
export class NavigationComponent {
  Permission: typeof Permission = Permission;
  navCollapsed = true;
  assets = environment.assets;

  constructor(
    private loginService: LoginService,
    private authService: AuthService,
    public router: Router) {
  }

  logout() {
    this.loginService.logout();
  }

  perm(permission: Permission) {
    if (!permission) {
      return true;
    }
    return this.authService.authorize(permission);
  }

  toProfile() {
    this.router.navigate(['/user/profile']);
  }

  getUserName() {
    return this.authService.getSessionUser().user.firstName + ' ' + this.authService.getSessionUser().user.lastName;
  }
}
