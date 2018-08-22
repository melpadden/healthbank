import {
  async, ComponentFixture, discardPeriodicTasks, fakeAsync, flushMicrotasks,
  TestBed, tick
} from '@angular/core/testing';
import {ListTimelinePageComponent} from './list-timeline-page.component';
import {TimelineModule} from '../timeline.module';
import {NgbModule} from '@ng-bootstrap/ng-bootstrap';
import {RouterTestingModule} from '@angular/router/testing';
import {AuthService} from '../../shared/auth/auth.service';
import {By} from '@angular/platform-browser';
import {TimeLineService} from '../../shared/timeline/services/timeline.service';
import {SessionUser} from '../../shared/user/user-session';
import {User} from '../../shared/user/user-data';
import {UserSignUpState} from '../../shared/user/user-sign-up-state.enum';
import {Observable} from 'rxjs/Observable';
import {IdentityService} from '../../shared/contact/services/identity.service';
import {ContactDecrypted} from '../../shared/contact/models/contact';
import {ENV_SETTING_TEST, ENV_SETTING_TEST_PROVIDER} from '../../settings-loader.spec';
import {RequestQueueService} from '../../shared/request-queue/request-queue.service';
import {HttpClientModule} from '@angular/common/http';
import {HttpClientTestingModule, HttpTestingController} from '@angular/common/http/testing';
import 'rxjs/add/observable/empty';

describe('ListTimelinePageComponent', () => {
  let component: ListTimelinePageComponent;
  let fixture: ComponentFixture<ListTimelinePageComponent>;
  let authService: AuthService;
  let timeLineSpy: jasmine.Spy;
  let httpMock: HttpTestingController;
  let requestQueueService: RequestQueueService;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        TimelineModule,
        RouterTestingModule,
        NgbModule.forRoot(),
        HttpClientModule,
        HttpClientTestingModule
      ],
      providers: [
        ENV_SETTING_TEST_PROVIDER
      ],
    })
      .compileComponents();
    fixture = TestBed.createComponent(ListTimelinePageComponent);
    component = fixture.componentInstance;
    authService = TestBed.get(AuthService);
    requestQueueService = TestBed.get(RequestQueueService);
    httpMock = TestBed.get(HttpTestingController);
    const sessionUser = new SessionUser(new User(), UserSignUpState.ACTIVATED);
    sessionUser.userId = '-1';
    spyOn(authService, 'getSessionUser').and.returnValue(sessionUser);
    const identityService: IdentityService = TestBed.get(IdentityService);
    spyOn(identityService, 'getContactsSubject').and.returnValue(Observable.of<ContactDecrypted>({
      contactInfo: {
        firstname: 'hans',
        lastname: 'Söllner',
        userId: 'id',
        email: 'test@test'
      }
    } as ContactDecrypted));
    spyOn(identityService, 'loadContactsSubject');
    const timeLineService: TimeLineService = TestBed.get(TimeLineService);
    timeLineSpy = spyOn(timeLineService, 'reloadItemsSubject').and.returnValue(Observable.of());
    fixture.detectChanges();

  }));

  it('should be compiled', () => {
    expect(component).toBeTruthy();
    expect(fixture.debugElement.query(By.css('app-list-timeline')).nativeElement).toBeTruthy();
    expect(fixture.debugElement.query(By.css('app-list-chrome')).nativeElement).toBeTruthy();
    expect(fixture.debugElement.queryAll(By.css('h1')).length).toBe(1);
    expect(fixture.debugElement.queryAll(By.css('a#new-timeline-entry')).length).toBe(1);
    expect(fixture.debugElement.queryAll(By.css('ul.general-list li')).length).toBe(1);
    const request = httpMock.match(ENV_SETTING_TEST.identityApiHost + '/api/v1/identity/-1/contacts');
    request.forEach(value => value.flush([]));
  });

  it('should load timeline items on init', fakeAsync(() => {
    timeLineSpy.calls.reset();
    component.ngOnInit();
    fixture.detectChanges();
    expect(timeLineSpy.calls.count()).toBe(1);
    flushMicrotasks();
    const request = httpMock.match(ENV_SETTING_TEST.identityApiHost + '/api/v1/identity/-1/contacts');
    request.forEach(value => value.flush([]));
    discardPeriodicTasks();
  }));

  afterEach(() => {
    httpMock.verify();
  });
});
