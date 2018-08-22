import {Component, Input, OnInit} from '@angular/core';
import {AuthService} from '../auth.service';
import {FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';
import {touchAllFields} from '../../ngrx-form/ngrx-form-utils';
import {UserService} from '../../user/user.service';
import {SessionUser} from '../../user/user-session';
import {APP_AUTH_CONFIG} from '../auth.config';
import {UserSignUpState} from '../../user/user-sign-up-state.enum';
import {Router} from '@angular/router';
import {environment} from '../../../../environments/environment';
import {emailValidator} from '../../validators/email.validator';
import {ToastService} from '../../toast/toast.service';
import {HttpErrorService} from '../../app-http/http-error.service';
import {LoginService} from '../login.service';

export enum ActivationCodeEntryState {
  ENTER_CODE = 'ENTER_CODE',
  REQUEST_NEW_CODE = 'REQUEST_NEW_CODE',
  CODE_REQUESTED = 'CODE_REQUESTED',
  ACTIVATED = 'ACTIVATED'
}

@Component({
  selector: 'app-sign-up-confirm-mail',
  templateUrl: './sign-up-confirm-mail.component.html',
  styleUrls: ['./sign-up.component.scss']
})
export class SignUpConfirmMailComponent implements OnInit {
  assets = environment.assets;
  @Input() sessionUser: SessionUser;
  activationForm: FormGroup;
  disable: boolean;
  STATE: typeof ActivationCodeEntryState = ActivationCodeEntryState;
  actualState = ActivationCodeEntryState.ENTER_CODE;
  requestCodeForm: FormGroup;


  constructor(private loginService: LoginService,
              private userService: UserService,
              private fb: FormBuilder,
              private errorService: HttpErrorService,
              private toastService: ToastService,
              private router: Router) {
    this.initFormDescription();
  }

  ngOnInit() {
    this.actualState = ActivationCodeEntryState.ENTER_CODE;
    this.enablePage();
  }

  disablePage() {
    this.activationForm.disable();
    this.disable = true;
  }

  enablePage() {
    this.activationForm.enable();
    this.disable = false;
  }

  activateAccount() {
    if (this.activationForm.invalid) {
      touchAllFields(this.activationForm);
      return;
    }
    this.disablePage();
    if (this.sessionUser.signUpState === UserSignUpState.ACTIVATED) {
      return;
    }
    this.userService.confirmIdentity(this.sessionUser, this.activationForm.value['code'])
      .subscribe(value => {
        this.sessionUser = value;
        sessionStorage.setItem(APP_AUTH_CONFIG.sessionUserTokenName, JSON.stringify(value));
        this.actualState = ActivationCodeEntryState.ACTIVATED;
        this.enablePage();
        this.activationForm.reset();
        this.toastService
          .success('signup.confirmMail.enterCode.toast.text.success',
            'signup.confirmMail.enterCode.toast.title.success');
        window.scrollTo(0, 0);
      }, error => {
        this.errorService.processErrorToast(error);
        this.enablePage();
      });
  }

  cancelSignUp() {
    this.loginService.logoutSessionUser();
  }

  requestNewCode() {
    if (this.requestCodeForm.invalid) {
      touchAllFields(this.requestCodeForm);
      return;
    }
    this.disableRequestCodePage();
    this.userService.requestNewActivationCode(this.sessionUser, this.requestCodeForm.value['email'])
      .subscribe(value => {
        this.sessionUser = value;
        sessionStorage.setItem(APP_AUTH_CONFIG.sessionUserTokenName, JSON.stringify(value));
        this.actualState = ActivationCodeEntryState.CODE_REQUESTED;
        this.enableRequestCodePage();
        this.requestCodeForm.reset();
        window.scrollTo(0, 0);
      }, error => {
        this.errorService.processErrorToast(error);
        this.enableRequestCodePage();
      });
  }

  initiateNewCodeRequest() {
    this.activationForm.reset();
    this.requestCodeForm = this.fb.group(
      {
        email: new FormControl('', [Validators.required, Validators.maxLength(128), emailValidator()]),
      });
    this.actualState = ActivationCodeEntryState.REQUEST_NEW_CODE;
  }

  continueToApp() {
    this.loginService.login(this.sessionUser)
      .then(value2 => {
        this.router.navigate(['timeline']);
      });
  }

  proceedToActivate() {
    this.actualState = ActivationCodeEntryState.ENTER_CODE;
  }

  private initFormDescription() {
    this.activationForm = this.fb.group(
      {
        code: new FormControl('',
          [Validators.required, Validators.maxLength(8), Validators.minLength(8)]),
      });
  }

  private disableRequestCodePage() {
    this.requestCodeForm.disable();
    this.disable = true;
  }

  private enableRequestCodePage() {
    this.requestCodeForm.enable();
    this.disable = false;
  }
}
