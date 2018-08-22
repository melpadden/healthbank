import {async, ComponentFixture, fakeAsync, flushMicrotasks, TestBed} from '@angular/core/testing';

import {RouterTestingModule} from '@angular/router/testing';
import {NgbModule} from '@ng-bootstrap/ng-bootstrap';
import {UserType} from '../../shared/auth/session/user-type.enum';
import {AuthService} from '../../shared/auth/auth.service';
import {Session} from '../../shared/auth/session/session.model';
import {Permission} from '../../shared/auth/session/permission.enum';
import {By} from '@angular/platform-browser';
import {ContactModule} from '../contact.module';
import {ContactDetailPageComponent} from './contact-detail-page.component';
import {Contact, ContactDecrypted} from '../../shared/contact/models/contact';
import {ContactService} from '../../shared/contact/services/contact.service';
import { ENV_SETTING_TEST_PROVIDER } from '../../settings-loader.spec';

describe('ContactDetailPageComponent', () => {
  let component: ContactDetailPageComponent;
  let fixture: ComponentFixture<ContactDetailPageComponent>;
  let authService: AuthService;
  let item: ContactDecrypted;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [ContactModule, RouterTestingModule, NgbModule.forRoot()],
      providers: [ENV_SETTING_TEST_PROVIDER]
    })
    .compileComponents();
    item = {
      userId: 'id',
      contactInfo: {
        firstname: 'firstname',
        lastname: 'lastname',
        email: 'owner@owner',
        userId: 'id',
        phone: '+1234564987'
      },
      invitationId: 'invitation'
    };
    authService = TestBed.get(AuthService);
    spyOn(authService, 'getSession').and.returnValue(new Session('usr', '-1', '666', 'jti-token', new Date(), UserType.DEFAULT,
      [
        Permission.TEST
      ]));
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ContactDetailPageComponent);
    component = fixture.componentInstance;
    component.contact = item;
    fixture.detectChanges();
  });

  it('should be compiled', fakeAsync(() => {
    expect(component).toBeTruthy();
    component.contact = item;
    fixture.detectChanges();
    flushMicrotasks();
    expect(fixture.debugElement.queryAll(By.css('app-contact-detail')).length).toBe(1);
  }));

  it('should display details on item loaded ', fakeAsync(() => {
    const contactService: ContactService = TestBed.get(ContactService);
    component.contact = item;
    fixture.detectChanges();
    flushMicrotasks();
    expect(fixture.debugElement.queryAll(By.css('app-contact-detail')).length).toBe(1);
  }));
});
