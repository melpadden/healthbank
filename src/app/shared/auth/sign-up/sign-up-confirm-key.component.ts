import {Component, EventEmitter, Input, Output} from '@angular/core';
import {AuthService} from '../auth.service';
import {UserService} from '../../user/user.service';
import {environment} from '../../../../environments/environment';
import {SessionUser} from '../../user/user-session';
import {APP_AUTH_CONFIG} from '../auth.config';
import {UserSignUpState} from '../../user/user-sign-up-state.enum';

@Component({
  selector: 'app-sign-up-confirm-key',
  templateUrl: './sign-up-confirm-key.component.html',
  styleUrls: ['./sign-up-confirm-key.component.scss', './sign-up.component.scss']
})
export class SignUpConfirmKeyComponent {
  @Input() privateKey: string;
  @Input() sessionUser: SessionUser;
  @Output() sessionUserChange = new EventEmitter<SessionUser>();
  stored: boolean;
  assets = environment.assets;

  constructor(private auth: AuthService,
              private userService: UserService) {
  }

  confirmPrivateKey() {
    // Update user state and call be
    if (!this.stored) {
      return;
    }
    this.sessionUser.keyStore = this.privateKey;
    this.sessionUser.signUpState = UserSignUpState.CREATED;
    this.userService.addUserToDb(this.sessionUser)
      .subscribe(value => {
        sessionStorage.setItem(APP_AUTH_CONFIG.sessionUserTokenName, JSON.stringify(value));
        this.sessionUserChange.emit(this.sessionUser);
        window.scrollTo(0, 0);
      });
  }

  toggleStored() {
    this.stored = !this.stored;
  }
}
