import {async, ComponentFixture, fakeAsync, TestBed} from '@angular/core/testing';
import {TimelineViewPageComponent} from './timeline-view-page.component';
import {RouterTestingModule} from '@angular/router/testing';
import {TimelineModule} from '../../../timeline/timeline.module';
import {NgbModule} from '@ng-bootstrap/ng-bootstrap';
import {AuthService} from '../../auth/auth.service';
import {By} from '@angular/platform-browser';
import {SessionUser} from '../../user/user-session';
import {UserSignUpState} from '../../user/user-sign-up-state.enum';
import {User} from '../../user/user-data';
import {TimeLineItemTD} from '../../../../test-common/test-data';
import { ENV_SETTING_TEST_PROVIDER } from '../../../settings-loader.spec';

describe('TimelineViewPageComponent', () => {
  let component: TimelineViewPageComponent;
  let fixture: ComponentFixture<TimelineViewPageComponent>;
  let authService: AuthService;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [TimelineModule, RouterTestingModule, NgbModule.forRoot()],
      providers: [ENV_SETTING_TEST_PROVIDER]
    })
    .compileComponents();
    authService = TestBed.get(AuthService);
    const sessionUser = new SessionUser(new User(), UserSignUpState.ACTIVATED);
    sessionUser.userId = '-1';
    spyOn(authService, 'getSessionUser').and.returnValue(sessionUser);
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TimelineViewPageComponent);
    component = fixture.componentInstance;
    component.timelineItem = TimeLineItemTD;
    fixture.detectChanges();
  });

  it('should be compiled', () => {
    expect(component).toBeTruthy();
    expect(fixture.debugElement.queryAll(By.css('app-timeline-view')).length).toBe(0);
  });

});
