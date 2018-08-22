import {async, ComponentFixture, TestBed} from '@angular/core/testing';
import {By} from '@angular/platform-browser';
import {DebugElement} from '@angular/core';
import {ReactiveFormsModule} from '@angular/forms';
import {SharedModule} from '../../shared.module';
import {FormErrorModule} from 'ngx-form-error';
import {RouterTestingModule} from '@angular/router/testing';
import {NgbModule} from '@ng-bootstrap/ng-bootstrap';
import {APP_AUTH_CONFIG} from '../auth.config';
import {SignUpConfirmKeyComponent} from './sign-up-confirm-key.component';
import {SignUpPageComponent} from './sign-up-page.component';
import {SignUpDataComponent} from './sign-up-data.component';
import {SignUpConfirmMailComponent} from './sign-up-confirm-mail.component';
import {toDateTime} from '../../date/date.type';
import {User} from '../../user/user-data';
import {SessionUser} from '../../user/user-session';
import {UserSignUpState} from '../../user/user-sign-up-state.enum';
import { ENV_SETTING_TEST_PROVIDER } from '../../../settings-loader.spec';

describe('SignUpPageComponent', () => {
  let component: SignUpPageComponent;
  let fixture: ComponentFixture<SignUpPageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        SharedModule,
        FormErrorModule,
        ReactiveFormsModule,
        RouterTestingModule,
        NgbModule.forRoot()
      ],
      declarations: [
        SignUpPageComponent,
        SignUpDataComponent,
        SignUpConfirmKeyComponent,
        SignUpConfirmMailComponent
      ],
      providers: [ENV_SETTING_TEST_PROVIDER]
    })
      .compileComponents();
  }));

  beforeEach(async(() => {
    fixture = TestBed.createComponent(SignUpPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should be created', () => {
    expect(component).toBeTruthy();
  });

  it('should render app-signup-data on init', () => {
    expect(component).toBeTruthy();
    const signUpData: DebugElement[] = fixture.debugElement.queryAll(By.css('app-sign-up-data'));
    const signUpKey: DebugElement[] = fixture.debugElement.queryAll(By.css('app-sign-up-confirm-key'));
    const signUpMail: DebugElement[] = fixture.debugElement.queryAll(By.css('app-sign-up-confirm-mail'));
    expect(signUpData.length).toBe(1);
    expect(signUpKey.length).toBe(0);
    expect(signUpMail.length).toBe(0);
  });

  it('should render app-signup-key on key set', () => {
    expect(component).toBeTruthy();
    const user = new User(true);
    const date = new Date();
    date.setFullYear(date.getFullYear() - 20);
    user.birthday = toDateTime(date);
    user.phone = '+123456';
    user.email = 'also@bitte';
    user.lastName = 'lstname';
    user.firstName = 'firstname';
    user.nationality = 'AUT';
    const sessionUser = new SessionUser(user, undefined);
    component.sessionUser = sessionUser;
    fixture.detectChanges();
    let signUpData: DebugElement[] = fixture.debugElement.queryAll(By.css('app-sign-up-data'));
    let signUpKey: DebugElement[] = fixture.debugElement.queryAll(By.css('app-sign-up-confirm-key'));
    let signUpMail: DebugElement[] = fixture.debugElement.queryAll(By.css('app-sign-up-confirm-mail'));
    expect(signUpData.length).toBe(1);
    expect(signUpKey.length).toBe(0);
    expect(signUpMail.length).toBe(0);
    component.privateKey = '123';
    fixture.detectChanges();
    signUpData = fixture.debugElement.queryAll(By.css('app-sign-up-data'));
    signUpKey = fixture.debugElement.queryAll(By.css('app-sign-up-confirm-key'));
    signUpMail = fixture.debugElement.queryAll(By.css('app-sign-up-confirm-mail'));
    expect(signUpData.length).toBe(0);
    expect(signUpKey.length).toBe(1);
    expect(signUpMail.length).toBe(0);
  });

  it('should render app-signup-mail on created and key confirmed', () => {
    expect(component).toBeTruthy();
    const user = new User(true);
    const date = new Date();
    date.setFullYear(date.getFullYear() - 20);
    user.birthday = toDateTime(date);
    user.phone = '+123456';
    user.email = 'also@bitte';
    user.lastName = 'lstname';
    user.firstName = 'firstname';
    user.nationality = 'AUT';
    const sessionUser = new SessionUser(user, UserSignUpState.CREATED);
    component.sessionUser = sessionUser;
    fixture.detectChanges();
    const signUpData: DebugElement[] = fixture.debugElement.queryAll(By.css('app-sign-up-data'));
    const signUpKey: DebugElement[] = fixture.debugElement.queryAll(By.css('app-sign-up-confirm-key'));
    const signUpMail: DebugElement[] = fixture.debugElement.queryAll(By.css('app-sign-up-confirm-mail'));
    expect(signUpData.length).toBe(0);
    expect(signUpKey.length).toBe(0);
    expect(signUpMail.length).toBe(1);
  });

  afterEach(() => {
    sessionStorage.removeItem(APP_AUTH_CONFIG.sessionUserTokenName);
  });

});
