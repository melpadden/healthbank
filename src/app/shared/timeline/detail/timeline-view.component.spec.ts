import {async, ComponentFixture, TestBed} from '@angular/core/testing';

import {TimelineViewComponent} from './timeline-view.component';
import {RouterTestingModule} from '@angular/router/testing';
import {TimelineModule} from '../../../timeline/timeline.module';
import {NgbModule} from '@ng-bootstrap/ng-bootstrap';
import {By} from '@angular/platform-browser';
import {testAuthConfig, TimeLineItemTD} from '../../../../test-common/test-data';
import {AuthService} from '../../auth/auth.service';
import {Observable} from 'rxjs/Observable';
import {TranslateService} from '@ngx-translate/core';
import {IdentityService} from '../../contact/services/identity.service';
import {ContactDecrypted} from '../../contact/models/contact';
import { ENV_SETTING_TEST_PROVIDER } from '../../../settings-loader.spec';

describe('TimelineViewComponent', () => {
  let component: TimelineViewComponent;
  let fixture: ComponentFixture<TimelineViewComponent>;

  beforeEach(async(() => {

    TestBed.configureTestingModule({
      imports: [TimelineModule, RouterTestingModule, NgbModule.forRoot()],
      providers: [ENV_SETTING_TEST_PROVIDER],
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TimelineViewComponent);
    component = fixture.componentInstance;
    component.item = TimeLineItemTD;
  });

  it('should be compiled', () => {

    const authService: AuthService = TestBed.get(AuthService);
    spyOn(authService, 'getSessionUser').and.returnValue(testAuthConfig.sessionUser);

    const translateService: TranslateService = TestBed.get(TranslateService);
    spyOn(translateService, 'get').and.returnValue(Observable.of(' '));
    const identityService: IdentityService = TestBed.get(IdentityService);
    spyOn(identityService, 'getContactFromCache').and.returnValue(Observable.of<ContactDecrypted>({
      contactInfo: {
        firstname: 'hans',
        lastname: 'Söllner',
        userId: 'id',
        email: 'test@test'
      }
    } as ContactDecrypted));

    fixture.detectChanges();
    expect(component).toBeTruthy();
    expect(fixture.debugElement.query(By.css('app-download-content')).nativeElement).toBeTruthy();
    expect(fixture.debugElement.query(By.css('app-preview-content')).nativeElement).toBeTruthy();
  });
});
