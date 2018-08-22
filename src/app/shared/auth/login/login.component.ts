import {Component, EventEmitter, Input, OnInit, Output, ViewChild} from '@angular/core';
import {SessionUser} from '../../user/user-session';
import {environment} from '../../../../environments/environment';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {touchAllFields} from '../../ngrx-form/ngrx-form-utils';
import {ActivatedRoute, Params, Router} from '@angular/router';
import {CryptoService} from '../../crypto/crypto.service';
import {UserSignUpState} from '../../user/user-sign-up-state.enum';
import {APP_AUTH_CONFIG} from '../auth.config';
import {ToastService} from '../../toast/toast.service';
import {RequestQueueService} from '../../request-queue/request-queue.service';
import {LoginService} from '../login.service';
import { Result } from '@zxing/library';
import { QrScannerComponent } from '../../qr/qr-scanner.component';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['login.component.scss']
})
export class LoginComponent implements OnInit {
  @Input() sessionUser: SessionUser;
  @Output() sessionUserChange = new EventEmitter<SessionUser>();
  loginForm: FormGroup;
  public password: string;
  assets = environment.assets;
  private param: Params;
  disableForm: boolean;

  constructor(private loginService: LoginService,
              private route: ActivatedRoute,
              private cryptoService: CryptoService,
              private requestQueueService: RequestQueueService,
              private toastService: ToastService,
              private router: Router) {
    this.initFormDescription();
  }

  ngOnInit() {
    this.route.queryParams.subscribe(value => {
      this.param = value;
    });
    this.enablePage(true);
  }

  public doLogin() {
    this.enablePage(false);
    this.toastService.clearOnPageChange();
    if (this.loginForm.invalid) {
      touchAllFields(this.loginForm);
      return;
    }
    this.cryptoService.clearKeystore();
    this.cryptoService.importKeystore(this.sessionUser.keyStore, this.loginForm.controls['password'].value)
      .then(value => {
        if (this.sessionUser.signUpState === UserSignUpState.ACTIVATED) {
          this.loginService.login(this.sessionUser, this.param)
            .then(() => {
              this.requestQueueService.initQueueWorker();
            })
            .catch(reason => {
              this.cryptoService.clearKeystore();
            })
            .then(() => this.enablePage(true));
        } else {
          sessionStorage.setItem(APP_AUTH_CONFIG.sessionUserTokenName, JSON.stringify(this.sessionUser));
          this.router.navigate([`/signup`]);
        }
      }).catch(reason => {
      this.enablePage(true);
      this.cryptoService.clearKeystore();
        this.toastService.error('login.toast.error.pwd.message', 'login.toast.error.pwd.title');
    });
  }

  public cancel() {
    window.sessionStorage.removeItem(APP_AUTH_CONFIG.sessionUserTokenName);
    this.sessionUser = undefined;
    this.sessionUserChange.emit(this.sessionUser);
  }

  public goToLandingPage(): void {
    this.loginService.logout();
  }

  private enablePage(enable: boolean): void {
    if (enable) {
      this.loginForm.enable();
    } else {
      this.loginForm.disable();
    }
    this.disableForm = !enable;
  }

  private initFormDescription() {
    this.loginForm = new FormGroup({
      password: new FormControl('', [Validators.required])
    });
  }
}
