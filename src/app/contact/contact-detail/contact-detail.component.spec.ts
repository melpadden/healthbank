import {async, ComponentFixture, TestBed} from '@angular/core/testing';

import {RouterTestingModule} from '@angular/router/testing';
import {NgbModule} from '@ng-bootstrap/ng-bootstrap';
import {ContactDetailComponent} from './contact-detail.component';
import {ContactModule} from '../contact.module';
import {ContactDecrypted} from '../../shared/contact/models/contact';

describe('ContactDetailComponent', () => {
  let component: ContactDetailComponent;
  let fixture: ComponentFixture<ContactDetailComponent>;
  let item: ContactDecrypted;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [ContactModule, RouterTestingModule, NgbModule.forRoot()]
    })
      .compileComponents();
    item = {
      userId: 'id',
      contactInfo: {
        firstname: 'firstname',
        lastname: 'lastname',
        email: 'owner@owner',
        userId: 'id',
        phone: '+123456789'
      },
      invitationId: 'invitation'
    };
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ContactDetailComponent);
    component = fixture.componentInstance;
    component.contact = item;
    fixture.detectChanges();
  });

  it('should be compiled', () => {
    expect(component).toBeTruthy();
  });
});
