import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { Component, DebugElement } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../auth/auth.service';
import { SharedModule } from '../shared.module';
import { RouterTestingModule } from '@angular/router/testing';
import { APP_AUTH_CONFIG } from '../auth/auth.config';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { UserSelectComponent } from './user-select-page.component';
import { ENV_SETTING_TEST_PROVIDER } from '../../settings-loader.spec';
import {LoginService} from '../auth/login.service';

describe('UserSelectComponent', () => {
  let component: UserSelectComponent;
  let fixture: ComponentFixture<UserSelectComponent>;
  let createUserBtn: DebugElement;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [FormsModule, SharedModule, NgbModule.forRoot(),
        RouterTestingModule.withRoutes(
          [{path: 'signup', component: DummyComponent}])],
      declarations: [UserSelectComponent, DummyComponent],
      providers: [{provide: LoginService, useClass: MockLoginService}, ENV_SETTING_TEST_PROVIDER]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UserSelectComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    createUserBtn = fixture.debugElement.query(By.css('button'));
  });

  it('should be compiled', () => {
    expect(component).toBeTruthy();
    expect(createUserBtn).toBeDefined();
  });

  it('should remove actual session user on create user clicked', () => {
    sessionStorage.setItem(APP_AUTH_CONFIG.sessionUserTokenName, '123');
    component.createUser();
    expect(sessionStorage.getItem(APP_AUTH_CONFIG.sessionUserTokenName)).toBeNull();
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

@Component({
  template: ''
})
class DummyComponent {
}
