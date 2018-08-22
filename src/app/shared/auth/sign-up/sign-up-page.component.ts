import {Component, OnInit} from '@angular/core';
import {AuthService} from '../auth.service';
import {SessionUser} from '../../user/user-session';
import {UserSignUpState} from '../../user/user-sign-up-state.enum';
import {environment} from '../../../../environments/environment';

@Component({
  selector: 'app-sign-up-page',
  templateUrl: './sign-up-page.component.html'
})
export class SignUpPageComponent implements OnInit {
  public privateKey: string;
  // userState: UserSignUpState;
  UserSignUpState: typeof UserSignUpState = UserSignUpState;
  sessionUser: SessionUser;
  assets = environment.assets;

  constructor(private auth: AuthService) {
  }

  ngOnInit() {
    if (this.auth.getSessionUser()) {
      this.sessionUser = this.auth.getSessionUser();
    }
  }
}
