import {async, ComponentFixture, fakeAsync, flushMicrotasks, TestBed} from '@angular/core/testing';
import {NgbModule} from '@ng-bootstrap/ng-bootstrap';
import {RouterTestingModule} from '@angular/router/testing';
import {By} from '@angular/platform-browser';
import {Observable} from 'rxjs/Observable';
import {ListTimelineComponent} from './list-timeline.component';
import {SharedModule} from '../../shared.module';
import {TimeLineFileMetadata, TimeLineItem, TimeLineMetaData} from '../models/timeline';
import {RequestQueueEntryState} from '../../request-queue/request-queue-entry-state';
import {RequestQueueStateEnum} from '../../request-queue/request-queue-state.enum';
import {RequestQueueService} from '../../request-queue/request-queue.service';
import {IdentityService} from '../../contact/services/identity.service';
import {ContactDecrypted} from '../../contact/models/contact';
import {TimeLineItemTD} from '../../../../test-common/test-data';
import {UserSignUpState} from '../../user/user-sign-up-state.enum';
import {User} from '../../user/user-data';
import {SessionUser} from '../../user/user-session';
import {AuthService} from '../../auth/auth.service';
import { ENV_SETTING_TEST_PROVIDER } from '../../../settings-loader.spec';

describe('ListTimelineComponent', () => {
  let component: ListTimelineComponent;
  let fixture: ComponentFixture<ListTimelineComponent>;
  // let authService: AuthService;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [SharedModule, RouterTestingModule, NgbModule.forRoot()],
      providers: [ENV_SETTING_TEST_PROVIDER],
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ListTimelineComponent);
    component = fixture.componentInstance;
  });

  it('should be compiled', () => {
    const identityService: IdentityService = TestBed.get(IdentityService);
    spyOn(identityService, 'getContactsSubject').and.returnValue(Observable.of<ContactDecrypted[]>([{
      contactInfo: {
        firstname: 'hans',
        lastname: 'Söllner',
        userId: 'id',
        email: 'test@test',
        phone: '+123456789'
      }
    } as ContactDecrypted]));

    spyOn(identityService, 'loadContactsSubject');

    const authService = TestBed.get(AuthService);
    const sessionUser = new SessionUser(new User(), UserSignUpState.ACTIVATED);
    sessionUser.userId = 'owner';
    sessionUser.user.firstName = 'test';
    sessionUser.user.lastName = 'user';
    spyOn(authService, 'getSessionUser').and.returnValue(sessionUser);

    component.loadedItems$ = Observable.of([TimeLineItemTD]);
    fixture.detectChanges();
    expect(component).toBeTruthy();
    expect(fixture.debugElement.query(By.css('app-list-chrome')).nativeElement).toBeTruthy();
    expect(fixture.debugElement.queryAll(By.css('ul.general-list li')).length).toBe(1);
  });

  xit('should show the upload queue state only for queued items', fakeAsync(() => {
    const item1 = new TimeLineItem();
    item1.id = 'id1';
    item1.metadata = new TimeLineMetaData();
    item1.metadata.title = 'item';
    item1.fileMetadata = new TimeLineFileMetadata();

    const item2 = new TimeLineItem();
    item2.id = 'id2';
    item2.metadata = new TimeLineMetaData();
    item2.metadata.title = 'queued item';
    item2.fileMetadata = new TimeLineFileMetadata();
    item2.requestQueueId = 13;

    const entryState = new RequestQueueEntryState(13, RequestQueueStateEnum.QUEUED, 1000, 170, 17);

    component.loadedItems$ = Observable.of([item1, item2]);
    const requestQueueService: RequestQueueService = TestBed.get(RequestQueueService);
    const requestQueueSpy: jasmine.Spy = spyOn(requestQueueService, 'getRequestState').and.returnValue(entryState);
    fixture.detectChanges();
    flushMicrotasks();
    expect(requestQueueSpy).toHaveBeenCalledWith(13);

    expect(fixture.debugElement.queryAll(By.css('ul.result-list li')).length).toBe(2);
    expect(fixture.debugElement.queryAll(By.css('div.queuedOverlay')).length).toBe(1);
  }));

  xit('should show items queued for deletion', fakeAsync(() => {
    const item1 = new TimeLineItem();
    item1.id = 'id1';
    item1.metadata = new TimeLineMetaData();
    item1.metadata.title = 'deleted item';
    item1.fileMetadata = new TimeLineFileMetadata();

    const item2 = new TimeLineItem();
    item2.id = 'id2';
    item2.metadata = new TimeLineMetaData();
    item2.metadata.title = 'queued item';
    item2.fileMetadata = new TimeLineFileMetadata();
    item1.markedForDeletion = true;

    const entryState = new RequestQueueEntryState(13, RequestQueueStateEnum.QUEUED, 1000, 170, 17);

    component.loadedItems$ = Observable.of([item1, item2]);
    const requestQueueService: RequestQueueService = TestBed.get(RequestQueueService);
    const requestQueueSpy: jasmine.Spy = spyOn(requestQueueService, 'getRequestState').and.returnValue(entryState);
    fixture.detectChanges();
    expect(requestQueueSpy.calls.count()).toBe(0);

    expect(fixture.debugElement.queryAll(By.css('ul.result-list li')).length).toBe(2);
    expect(fixture.debugElement.queryAll(By.css('ul.result-list li div.deletedOverlay')).length).toBe(1);
  }));
});
