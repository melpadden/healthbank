/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';
import { LoginComponent } from './login.component';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import { AuthService } from '../auth.service';
import { SharedModule } from '../../shared.module';
import {NgbModule} from '@ng-bootstrap/ng-bootstrap';
import {FormErrorModule} from 'ngx-form-error';
import {RouterTestingModule} from '@angular/router/testing';
import { ENV_SETTING_TEST_PROVIDER } from '../../../settings-loader.spec';
import {LoginService} from '../login.service';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let loginBtn: DebugElement;
  let loginFrm: DebugElement;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [FormsModule, RouterTestingModule, NgbModule.forRoot(),
        ReactiveFormsModule, SharedModule, FormErrorModule],
      declarations: [LoginComponent],
      providers: [{provide: LoginService, useClass: MockLoginService}, ENV_SETTING_TEST_PROVIDER]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    loginBtn = fixture.debugElement.query(By.css('#submit'));
    loginFrm = fixture.debugElement.query(By.css('form'));
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

class MockLoginService extends LoginService {
  constructor() {
    super(null, null, null, null, null, null, null, null);
  }

  login(): Promise<any> {
    return Promise.resolve({});
  }
}
