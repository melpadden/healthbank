import {Component, EventEmitter, OnInit, Output} from '@angular/core';
import {AuthService} from '../auth/auth.service';
import {UserService} from '../user/user.service';
import {Observable} from 'rxjs/Observable';
import {SessionUser} from '../user/user-session';
import {environment} from '../../../environments/environment';
import {Router} from '@angular/router';
import {TranslateService} from '@ngx-translate/core';
import {getLocaleSupport} from '../../core/utils/helper';

@Component({
  selector: 'app-user-select-page',
  templateUrl: './user-select-page.component.html',
  styleUrls: ['./user-select-page.component.scss']

})
export class UserSelectComponent implements OnInit {
  assets = environment.assets;
  users$: Observable<SessionUser[]>;

  @Output() sessionUser = new EventEmitter<SessionUser>();

  constructor(private auth: AuthService,
              private userService: UserService,
              private translate: TranslateService,
              private router: Router) {
  }

  ngOnInit() {
    this.users$ = this.loadUsers();
  }

  itemClicked(item: SessionUser) {
    this.sessionUser.emit(item);
  }

  createUser() {
    this.auth.removeSessionUser();
    this.router.navigate([`/signup`]);
  }

  private loadUsers(): Observable<SessionUser[]> {
    return this.userService.getUsersFromDb().map((value: SessionUser[]) => {
      const localeSupport = getLocaleSupport();
      return value.sort((a: SessionUser, b: SessionUser): number => {
        const aItem = a.user.firstName + ' ' + a.user.lastName;
        const bItem = b.user.firstName + ' ' + b.user.lastName;

        if (localeSupport) {
          return aItem.localeCompare(bItem, this.translate.currentLang, {caseFirst: 'upper'});
        } else {
          return aItem.localeCompare(bItem);
        }
      });

    });
  }
}
