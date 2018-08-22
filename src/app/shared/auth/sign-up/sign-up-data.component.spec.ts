/* tslint:disable:no-unused-variable */
import {async, ComponentFixture, TestBed} from '@angular/core/testing';
import {SignUpDataComponent} from './sign-up-data.component';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {SharedModule} from '../../shared.module';
import {FormErrorModule} from 'ngx-form-error';
import {RouterTestingModule} from '@angular/router/testing';
import {NgbModule} from '@ng-bootstrap/ng-bootstrap';
import {toDateTime} from '../../date/date.type';
import {APP_AUTH_CONFIG} from '../auth.config';
import {ENV_SETTING_TEST_PROVIDER} from '../../../settings-loader.spec';

describe('SignUpDataComponent', () => {
  let component: SignUpDataComponent;
  let fixture: ComponentFixture<SignUpDataComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        FormsModule,
        RouterTestingModule,
        NgbModule.forRoot(),
        ReactiveFormsModule,
        SharedModule,
        FormErrorModule
      ],
      declarations: [SignUpDataComponent],
      providers: [ENV_SETTING_TEST_PROVIDER],
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SignUpDataComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should accept valid user', () => {
    const date = new Date();
    date.setFullYear(date.getFullYear() - 20);
    const user = {
      birthday: toDateTime(date),
      phone: '+123456',
      email: 'also@bitte',
      lastName: 'lstname',
      firstName: 'firstname',
      nationality: 'at',
      pwd: 'asdfasdf',
      pwdConfirm: 'asdfasdf',
      termsCheckbox: true
    };

    component.signUpForm.setValue(user);
    expect(component.signUpForm.valid).toBe(true);
  });

  afterEach(() => {
    sessionStorage.removeItem(APP_AUTH_CONFIG.sessionUserTokenName);
  });

});
