import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {AbstractControl, FormControl, FormGroup, Validators} from '@angular/forms';
import {User} from '../../user/user-data';
import {touchAllFields} from '../../ngrx-form/ngrx-form-utils';
import {SessionUser} from '../../user/user-session';
import {COUNTRIES} from '../../countries';
import {emailValidator} from '../../validators/email.validator';
import {phoneNumberValidator} from '../../validators/phone-number.validator';
import {NgbDate} from '@ng-bootstrap/ng-bootstrap/datepicker/ngb-date';
import {TranslateService} from '@ngx-translate/core';
import {CryptoService} from '../../crypto/crypto.service';
import {UserService} from '../../user/user.service';
import {HttpErrorService} from '../../app-http/http-error.service';
import {LoginService} from '../login.service';
import {passwordMatchFormValidator} from '../../validators/password-match.validator';

@Component({
  selector: 'app-sign-up-data',
  templateUrl: './sign-up-data.component.html',
  styleUrls: ['./sign-up.component.scss']
})
export class SignUpDataComponent implements OnInit {
  @Input() sessionUser: SessionUser;
  @Output() sessionUserChange = new EventEmitter<SessionUser>();
  @Output() generateKeys = new EventEmitter();
  @Input() privateKey: string;
  @Output() privateKeyChange = new EventEmitter<string>();

  maxBirthDate: NgbDate;
  dataPickerDefaultDate: NgbDate;
  signUpForm: FormGroup;
  countryList: Array<{ id: string, label: string }> = [];
  disable: boolean;

  constructor(private loginService: LoginService,
              private translate: TranslateService,
              private cryptoService: CryptoService,
              private errorService: HttpErrorService,
              private userService: UserService) {
    this.initFormDescription();
    this.setupCountryList();
  }

  ngOnInit() {
    const actualDate = new Date();
    this.maxBirthDate = new NgbDate(actualDate.getFullYear() - 18, actualDate.getMonth() + 1, actualDate.getDate());
    this.dataPickerDefaultDate = new NgbDate(actualDate.getFullYear() - 19, actualDate.getMonth() + 1, actualDate.getDate());
    this.enablePage();
  }

  public submitUserData() {
    if (this.signUpForm.invalid) {
      touchAllFields(this.signUpForm);
      return;
    }
    this.disablePage();
    const pwd = this.signUpForm.getRawValue().pwd;
    this.sessionUser = new SessionUser(this.mapFormUser(this.signUpForm.getRawValue()), undefined);
    this.sessionUserChange.emit(this.sessionUser);
    this.startEnrollment(pwd);
  }

  startEnrollment(pwd: string) {
    this.cryptoService.generateKeypairs()
      .then(() => {
        this.userService.enrollUser(this.sessionUser, pwd)
          .then(privateKey => {
            this.privateKeyChange.emit(privateKey);
            window.scrollTo(0, 0);
          }).catch((err) => {
          console.error(err);
          this.errorService.processErrorToast(err);
          this.enablePage();
        });
      });
  }

  disablePage() {
    this.signUpForm.disable();
    this.disable = true;
  }

  enablePage() {
    this.signUpForm.enable();
    this.disable = false;
  }

  navigateToTermsAndConditions() {
    this.translate.get('signup.data.form.termsAndConditions.link').subscribe((translation) => {
      window.open(translation, '_blank');
    });
  }

  navigateToPrivacyConditions() {
    this.translate.get('signup.data.form.privacyConditions.link').subscribe((translation) => {
      window.open(translation, '_blank');
    });
  }

  cancelSignUp() {
    this.loginService.logout();
  }

  private initFormDescription() {
    this.signUpForm = new FormGroup({
      firstName: new FormControl('', [Validators.required, Validators.maxLength(128)]),
      lastName: new FormControl('', [Validators.required, Validators.maxLength(128)]),
      nationality: new FormControl('', [Validators.required, Validators.maxLength(2), Validators.minLength(2)]),
      birthday: new FormControl('', [Validators.required]),
      phone: new FormControl('', [phoneNumberValidator()]),
      email: new FormControl('', [Validators.required, Validators.maxLength(128), emailValidator()]),
      pwd: new FormControl('', [Validators.required, Validators.maxLength(128), Validators.minLength(8)]),
      pwdConfirm: new FormControl('', [Validators.required, Validators.maxLength(128), Validators.minLength(8)]),
      termsCheckbox: new FormControl('', [(control: AbstractControl) => control.value !== true ? {'terms': null} : null])
    }, passwordMatchFormValidator('pwd', 'pwdConfirm'));
  }

  private mapFormUser(formUser: any): User {
    const user: User = new User();
    user.firstName = formUser.firstName;
    user.lastName = formUser.lastName;
    user.nationality = formUser.nationality;
    user.birthday = formUser.birthday;
    user.phone = formUser.phone;
    user.email = formUser.email;
    return user;
  }

  private setupCountryList() {
    const countryTranslateIds: string[] = [];
    const reverseMap: { [key: string]: string } = {};

    for (const countryId in COUNTRIES) {
      if (COUNTRIES.hasOwnProperty(countryId)) {
        countryTranslateIds.push(COUNTRIES[countryId]);
        reverseMap[COUNTRIES[countryId]] = countryId;
      }
    }

    this.translate.get(countryTranslateIds).subscribe(i18nMap => {
      for (const key in i18nMap) {
        if (i18nMap.hasOwnProperty(key)) {
          this.countryList.push({id: reverseMap[key], label: i18nMap[key]});
        }
      }
      this.countryList.sort((c1, c2) => c1.label.localeCompare(c2.label, this.translate.getBrowserLang()));
    });
  }
}
