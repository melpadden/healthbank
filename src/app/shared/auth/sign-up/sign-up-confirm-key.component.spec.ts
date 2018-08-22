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
import {SignUpConfirmKeyComponent} from './sign-up-confirm-key.component';
import { ENV_SETTING_TEST_PROVIDER } from '../../../settings-loader.spec';

describe('SignUpConfirmKeyComponent', () => {
  let component: SignUpConfirmKeyComponent;
  let fixture: ComponentFixture<SignUpConfirmKeyComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        FormsModule, RouterTestingModule, NgbModule.forRoot(),
        ReactiveFormsModule, SharedModule, FormErrorModule],
      declarations: [SignUpConfirmKeyComponent],
      providers: [ENV_SETTING_TEST_PROVIDER]
    })
      .compileComponents();
  }));

  beforeEach(async(() => {
    fixture = TestBed.createComponent(SignUpConfirmKeyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should be created', () => {
    expect(component).toBeTruthy();
  });

  it('should render key output text field in readonly mode', () => {
    expect(component).toBeTruthy();
    const form: DebugElement[] = fixture.debugElement.queryAll(By.css('textarea#privateKeyId'));
    expect(form[0].attributes['id']).toBe('privateKeyId');
    expect(form[0].attributes['readonly']).toBe('');
  });

  it('should have a disabled submit button until checkbox is checked', () => {
    expect(component).toBeTruthy();
    const button: DebugElement[] = fixture.debugElement.queryAll(By.css('button#acceptPrivateKey'));
    expect(button[0].properties['disabled']).toBe(true);
    component.toggleStored();
    fixture.detectChanges();
    expect(button[0].properties['disabled']).toBe(false);
  });

  afterEach(() => {
    sessionStorage.removeItem(APP_AUTH_CONFIG.sessionUserTokenName);
  });

});
