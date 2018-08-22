import {User} from './user-data';
import {UserSignUpState} from './user-sign-up-state.enum';

export class SessionUser {
  userId: string;
  user: User;
  signUpState: UserSignUpState;
  keyStore: any;
  createdAt: Date;

  constructor(user: User, signUpState: UserSignUpState) {
    this.user = user;
    this.signUpState = signUpState;
  }
}
