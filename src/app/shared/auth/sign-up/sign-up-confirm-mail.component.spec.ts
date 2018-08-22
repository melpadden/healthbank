/* tslint:disable:no-unused-variable */
import {async, ComponentFixture, TestBed} from '@angular/core/testing';
import {By} from '@angular/platform-browser';
import {DebugElement} from '@angular/core';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {SharedModule} from '../../shared.module';
import {FormErrorModule} from 'ngx-form-error';
import {RouterTestingModule} from '@angular/router/testing';
import {NgbModule} from '@ng-bootstrap/ng-bootstrap';
import {APP_AUTH_CONFIG} from '../auth.config';
import {ActivationCodeEntryState, SignUpConfirmMailComponent} from './sign-up-confirm-mail.component';
import { ENV_SETTING_TEST_PROVIDER } from '../../../settings-loader.spec';

describe('SignUpConfirmMailComponent', () => {
  let component: SignUpConfirmMailComponent;
  let fixture: ComponentFixture<SignUpConfirmMailComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [FormsModule, RouterTestingModule, NgbModule.forRoot(),
        ReactiveFormsModule, SharedModule, FormErrorModule],
      declarations: [SignUpConfirmMailComponent],
      providers: [ENV_SETTING_TEST_PROVIDER]
    })
      .compileComponents();
  }));

  beforeEach(async(() => {
    fixture = TestBed.createComponent(SignUpConfirmMailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should be created', () => {
    expect(component).toBeTruthy();
  });

  it('render activation code input on init', () => {

    expect(component).toBeTruthy();
    const form: DebugElement[] = fixture.debugElement.queryAll(By.css('form'));
    expect(form[0].attributes['id']).toBe('enterCodeForm');
  });

  it('render code requested page on code request state is set', () => {
    let element: DebugElement[] = fixture.debugElement.queryAll(By.css('div#codeRequestedView'));
    expect(element.length).toBe(0);
    component.actualState = ActivationCodeEntryState.CODE_REQUESTED;
    fixture.detectChanges();
    element = fixture.debugElement.queryAll(By.css('div#codeRequestedView'));
    expect(element[0].attributes['id']).toBe('codeRequestedView');
  });

  it('render code request new code page on request new code state is set', () => {
    let element: DebugElement[] = fixture.debugElement.queryAll(By.css('form#requestNewCodeView'));
    expect(element.length).toBe(0);
    component.initiateNewCodeRequest();
    component.actualState = ActivationCodeEntryState.REQUEST_NEW_CODE;
    fixture.detectChanges();
    element = fixture.debugElement.queryAll(By.css('form'));
    expect(element.length).toBe(1);
    expect(element[0].attributes['id']).toBe('requestNewCodeView');
  });

  it('render code request new code page on request new code state is set', () => {
    let element: DebugElement[] = fixture.debugElement.queryAll(By.css('div#userActivatedView'));
    expect(element.length).toBe(0);
    component.actualState = ActivationCodeEntryState.ACTIVATED;
    fixture.detectChanges();
    element = fixture.debugElement.queryAll(By.css('div#userActivatedView'));
    expect(element[0].attributes['id']).toBe('userActivatedView');
    const forms: DebugElement[] = fixture.debugElement.queryAll(By.css('form'));
    expect(forms.length).toBe(0);
  });

  afterEach(() => {
    sessionStorage.removeItem(APP_AUTH_CONFIG.sessionUserTokenName);
  });

});
