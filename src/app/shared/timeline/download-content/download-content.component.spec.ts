import {async, ComponentFixture, fakeAsync, flushMicrotasks, TestBed} from '@angular/core/testing';

import {DownloadContentComponent} from './download-content.component';
import {RouterTestingModule} from '@angular/router/testing';
import {NgbModule} from '@ng-bootstrap/ng-bootstrap';
import {By} from '@angular/platform-browser';
import {TimeLineService} from '../services/timeline.service';
import 'rxjs/add/observable/of';
import {SharedModule} from '../../shared.module';
import {testAuthConfig, TimeLineItemTD} from '../../../../test-common/test-data';
import {AuthService} from '../../auth/auth.service';
import {IdentityService} from '../../contact/services/identity.service';
import {Observable} from 'rxjs/Observable';
import { ENV_SETTING_TEST_PROVIDER } from '../../../settings-loader.spec';


describe('DownloadContentComponent', () => {
  let component: DownloadContentComponent;
  let fixture: ComponentFixture<DownloadContentComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [SharedModule, RouterTestingModule, NgbModule.forRoot()],
      providers: [ENV_SETTING_TEST_PROVIDER],
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DownloadContentComponent);
    component = fixture.componentInstance;
    component.timeLineItem = TimeLineItemTD;
    component.timeLineItem.contentReference = 'contentRef';
    component.timeLineItem.users = {
      [testAuthConfig.sessionUser.userId]: {
        key: 'key'
      }
    };
    fixture.detectChanges();
  });

  it('should be compiled', () => {
    expect(component).toBeTruthy();
    expect(fixture.debugElement.query(By.css('a')).nativeElement).toBeTruthy();
  });

  it('should download file on click', fakeAsync(() => {
    const timeLineService: TimeLineService = TestBed.get(TimeLineService);
    const identityService: IdentityService = TestBed.get(IdentityService);
    const authService: AuthService = TestBed.get(AuthService);
    spyOn(identityService, 'getIdentityFromCache').and.returnValue(Observable.of({}) );
    spyOn(authService, 'getSessionUser').and.returnValue(testAuthConfig.sessionUser);
    const timeLineSpy: jasmine.Spy = spyOn(timeLineService, 'getContent').and.returnValue(Observable.of());
    component.clickedFile();
    flushMicrotasks();
    expect(timeLineSpy.calls.count()).toBe(1);
  }));
});
