import {fakeAsync, flushMicrotasks, TestBed} from '@angular/core/testing';
import {NgbModule} from '@ng-bootstrap/ng-bootstrap';
import {RouterTestingModule} from '@angular/router/testing';
import {TimeLineService} from './timeline.service';
import {Observable} from 'rxjs/Observable';
import {b64ToBlob} from '../../../../test-common/helper';
import {RequestQueueService} from '../../request-queue/request-queue.service';
import {SharedModule} from '../../shared.module';
import {TimeLineItemEncryptedWithContent, TimelineResponseContinuation} from '../models/timeline';
import {ItemType} from '../models/enums/item-type.enum';
import {DateTime} from '../../date/date.type';
import {testAuthConfig, TimeLineItemTD} from '../../../../test-common/test-data';
import {ENV_SETTING_TEST, ENV_SETTING_TEST_PROVIDER} from '../../../settings-loader.spec';
import {CryptoItemService} from '../../crypto/crypto-item.service';
import {HttpClientTestingModule, HttpTestingController} from '@angular/common/http/testing';
import {HttpClientModule} from '@angular/common/http';
import {RequestQueueEntry} from '../../request-queue/request-queue-entry';
import {AuthService} from '../../auth/auth.service';

const pic = b64ToBlob('iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAIAAACQkWg2AAAAGklEQVQoz2NgYPhPIqK' +
  'fBvxgVMPw0TBoEh8AFiXGSBqxMX0AAAAASUVORK5CYII=', 'image/png');
const thumb = b64ToBlob('iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAIAAACQkWg2AAAAGklEQVQoz2NgYPhPIqK' +
  'fBvxgVMPw0TBoEh8AFiXGSBqxMX0AAAAASUVORK5CYII=', 'image/png');

describe('TimeLineService', () => {
  let timeLineService: TimeLineService;
  let cryptoItemService: CryptoItemService;
  let requestQueueService: RequestQueueService;
  let httpMock: HttpTestingController;
  let authService: AuthService;
  let timlineItem: any;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        NgbModule.forRoot(),
        SharedModule,
        RouterTestingModule,
        HttpClientModule,
        HttpClientTestingModule
      ],
      providers: [
        ENV_SETTING_TEST_PROVIDER,
      ]
    });

    timlineItem = {
      owner: 'testOwner',
      itemType: ItemType.DOCUMENT,
      time: '2018-01-01T00:00:00.511Z' as DateTime,
      uploadTime: null,
      metadata: 'encrypted',
      fileMetadata: 'test'
    };
    const result: TimeLineItemEncryptedWithContent = new TimeLineItemEncryptedWithContent();
    result.timelineItemEncrypted = timlineItem;
    result.thumbnail = new Blob();
    result.content = new Blob();

    timeLineService = TestBed.get(TimeLineService);
    cryptoItemService = TestBed.get(CryptoItemService);
    requestQueueService = TestBed.get(RequestQueueService);
    httpMock = TestBed.get(HttpTestingController);
    authService = TestBed.get(AuthService);
    spyOn(cryptoItemService, 'encryptTimeLineItem').and.returnValue(Promise.resolve(result));
    spyOn(authService, 'getSessionUser').and.returnValue(testAuthConfig.sessionUser);

  });

  it('should create a TimeLine Item by multipart', fakeAsync(() => {
    const memberId = 'testOwner';
    const mItem = TimeLineItemTD;

    const requestQueueServiceSpy = spyOn(requestQueueService, 'queueMultipartRequest').and.returnValue(Observable.of(13));
    timeLineService.createItemMultiPart(memberId, mItem, pic, thumb).subscribe(value => {
      expect(value).toBe(13);
      expect(requestQueueServiceSpy).toHaveBeenCalledTimes(1);
    }, error => {
      fail(error);
    });
    flushMicrotasks();
  }));

  it('should push all timeline items from queue and BE to subject', fakeAsync(() => {
    const memberId = 'testOwner';
    const mItem = TimeLineItemTD;
    timeLineService.getItemsSubject().next([mItem]);
    expect(timeLineService.getItemsSubject().getValue()).toEqual([mItem]);

    const requestQueueServiceSpy = spyOn(requestQueueService, 'getQueuedRequests').and.returnValue(Observable.of([
      {jsonData: {item: timlineItem}, queueId: 1} as RequestQueueEntry]));
    spyOn(timeLineService, 'decryptTimeLineItem').and.returnValue(Promise.resolve(timlineItem));

    timeLineService.reloadItemsSubject(memberId).subscribe(value => {
      expect(value).toBe('continuationToken');
      expect(requestQueueServiceSpy).toHaveBeenCalledTimes(1);
      expect(timeLineService.getItemsSubject().getValue()).toEqual([timlineItem]);
      expect(timeLineService.getItemsSubject().getValue().length).toBe(1);
    }, error => {
      fail(error);
    });

    flushMicrotasks();
    const getItemsRequest = httpMock.expectOne(ENV_SETTING_TEST.timelineApiHost + '/api/v1/timeline/testOwner/items');
    getItemsRequest.flush([mItem], {headers: {'x-response-continuation': 'continuationToken'}});

  }));

  it('should load more timeline items from BE and push them to subject', fakeAsync(() => {
    const memberId = 'testOwner';
    timeLineService.resetItemsSubject();

    spyOn(timeLineService, 'decryptResponseContinuation')
      .and.returnValue(Promise.resolve({
      timelineItems: [timlineItem],
      responseContinuation: 'token'
    } as TimelineResponseContinuation));

    timeLineService.getMore(memberId, 'continuationToken').subscribe(value => {
      expect(value).toBe('token');
      expect(timeLineService.getItemsSubject().getValue()).toContain(timlineItem);
      expect(timeLineService.getItemsSubject().getValue().length).toBe(1);
    }, error => {
      fail(error);
    });

    flushMicrotasks();
    const getItemsRequest = httpMock.expectOne(ENV_SETTING_TEST.timelineApiHost + '/api/v1/timeline/testOwner/items');
    getItemsRequest.flush([timlineItem], {headers: {'x-response-continuation': 'token'}});

  }));

  it('should decrypt shared timeline item on owner != sessionUser', fakeAsync(() => {
    const memberId = 'testOwner';

    spyOn(cryptoItemService, 'decryptSharedTimeLineItem').and.returnValue(Promise.resolve());
    spyOn(cryptoItemService, 'decryptTimeLineItem').and.returnValue(Promise.resolve());

    timeLineService.decryptTimeLineItem(timlineItem)
      .then(value => {

      })
      .catch(error => {
        fail(error);
      });

    expect(cryptoItemService.decryptSharedTimeLineItem).toHaveBeenCalledTimes(1);
    expect(cryptoItemService.decryptTimeLineItem).toHaveBeenCalledTimes(0);
    flushMicrotasks();

  }));

  it('should decrypt timeline item on owner == sessionUser', fakeAsync(() => {
    const memberId = 'testOwner';
    timlineItem.owner = authService.getSessionUser().userId;

    spyOn(cryptoItemService, 'decryptSharedTimeLineItem').and.returnValue(Promise.resolve());
    spyOn(cryptoItemService, 'decryptTimeLineItem').and.returnValue(Promise.resolve());

    timeLineService.decryptTimeLineItem(timlineItem)
      .then(value => {

      })
      .catch(error => {
        fail(error);
      });

    expect(cryptoItemService.decryptSharedTimeLineItem).toHaveBeenCalledTimes(0);
    expect(cryptoItemService.decryptTimeLineItem).toHaveBeenCalledTimes(1);
    flushMicrotasks();

  }));

  afterEach(() => {
    httpMock.verify();
  });
});
