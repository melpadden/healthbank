import {async, ComponentFixture, TestBed} from '@angular/core/testing';
import {NgbModule} from '@ng-bootstrap/ng-bootstrap';
import {RouterTestingModule} from '@angular/router/testing';
import {ProfilePageComponent} from './profile-page.component';
import {UserModule} from '../user.module';
import {AuthService} from '../../shared/auth/auth.service';
import {User} from '../../shared/user/user-data';
import {UserSignUpState} from '../../shared/user/user-sign-up-state.enum';
import {SessionUser} from '../../shared/user/user-session';
import {DateTime} from '../../shared/date/date.type';
import {ENV_SETTING_TEST_PROVIDER} from '../../settings-loader.spec';
import {By} from '@angular/platform-browser';

export const UserTD: User = {
  firstName: 'user',
  lastName: 'test',
  nationality: 'at',
  email: 'user@test.com',
  phone: '+43123456789',
  birthday: '2000-01-01T00:00:00.511Z' as DateTime,
  enrolled: '2018-10-04T00:00:00.511Z' as DateTime,
  storage: '10MB',
};

export const UserSessionTD: SessionUser = {
  userId: '-1',
  user: UserTD,
  signUpState: UserSignUpState.ACTIVATED,
  keyStore: '!"§$%&/()=""><_,.',
  createdAt: new Date()
};

describe('ProfilePageComponent', () => {
  let component: ProfilePageComponent;
  let fixture: ComponentFixture<ProfilePageComponent>;
  let authService: AuthService;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [UserModule, RouterTestingModule, NgbModule.forRoot()],
      providers: [ENV_SETTING_TEST_PROVIDER]
    }).compileComponents();
    authService = TestBed.get(AuthService);
    spyOn(authService, 'getSessionUser').and.returnValue(UserSessionTD);
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProfilePageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeDefined();
  });

  it('should have the user information from the session', () => {
    expect(component.user).toBe(UserTD);
  });

  it('should show user in ui', () => {
    const h2Element = fixture.debugElement.query(By.css('#qa-user-name-header'));
    const firstNameElement = fixture.debugElement.query(By.css('#qa-first-name-content'));
    const lastNameElement = fixture.debugElement.query(By.css('#qa-last-name-content'));
    const nationalityNameElement = fixture.debugElement.query(By.css('#qa-nationality-content'));
    const mailElement = fixture.debugElement.query(By.css('#qa-mail-content'));
    const phoneElement = fixture.debugElement.query(By.css('#qa-phone-content'));

    expect(h2Element.nativeElement.textContent.trim()).toEqual(UserTD.firstName + ' ' + UserTD.lastName);
    expect(firstNameElement.nativeElement.textContent.trim()).toEqual(UserTD.firstName);
    expect(lastNameElement.nativeElement.textContent.trim()).toEqual(UserTD.lastName);
    expect(nationalityNameElement.nativeElement.textContent.trim()).toEqual('global.countries.at');
    expect(mailElement.nativeElement.textContent.trim()).toEqual(UserTD.email);
    expect(phoneElement.nativeElement.textContent.trim()).toEqual(UserTD.phone);
  });


  it('should be correct country to code mapping', () => {
    expect(component.getNationality('at')).toBe('global.countries.at');
    expect(component.getNationality('de')).toBe('global.countries.de');
    expect(component.getNationality('ch')).toBe('global.countries.ch');
  });
});
