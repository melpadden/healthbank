import {Inject, Injectable} from '@angular/core';
import {HttpClient, HttpHeaders, HttpResponse} from '@angular/common/http';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/share';
import 'rxjs/add/operator/mergeMap';
import 'rxjs/add/operator/switchMap';
import {HttpErrorService} from '../../app-http/http-error.service';
import {AuthService} from '../../auth/auth.service';
import {CryptoService} from '../../crypto/crypto.service';
import {ContactDecrypted} from '../../contact/models/contact';
import * as _ from 'lodash';
import {Identity} from '../../user/enrollment';
import {
  RESPONSE_CONTINUATION_HEADER,
  TimeLineItem,
  TimeLineItemEncrypted,
  TimelineResponseContinuation
} from '../models/timeline';
import {IdentityService} from '../../contact/services/identity.service';
import * as urlTemplate from 'url-template';
import {ObjectWithPermission} from '../../permission/permission';
import {Observable} from 'rxjs/Observable';
import {TimeLineService} from './timeline.service';
import {RequestQueueEntry} from '../../request-queue/request-queue-entry';
import {BehaviorSubject} from 'rxjs/BehaviorSubject';
import {RequestQueueService} from '../../request-queue/request-queue.service';
import {ENV_SETTINGS_TOKEN, EnvSettings} from '../../../settings-loader';
import {CacheService} from '../../cache/cache.service';
import 'rxjs/add/operator/defaultIfEmpty';

/**
 * ShareItem Service.
 */
@Injectable()
export class ShareItemService {

  private static sharedWithItemsSubject$: BehaviorSubject<TimeLineItem[]> = new BehaviorSubject<TimeLineItem[]>([]);
  private static _sharedWithItemList: TimeLineItem[] = [];

  private DELETE_SHARED_WITH_TIMELINE_ITEM_SUCCESS_CALLBACK = 'DELETE_SHARED_WITH_ITEM_SUCCESS';

  constructor(private http: HttpClient,
              private errorService: HttpErrorService,
              private authService: AuthService,
              private timelineService: TimeLineService,
              private identityService: IdentityService,
              private requestQueueService: RequestQueueService,
              private cryptoService: CryptoService,
              private cacheService: CacheService,
              @Inject(ENV_SETTINGS_TOKEN) private config: EnvSettings) {
    this.requestQueueService.registerCallBackMethod(
      this.DELETE_SHARED_WITH_TIMELINE_ITEM_SUCCESS_CALLBACK, ShareItemService.removeDeletedTimeLineItemFromList);
  }

  shareItem(timeLineItem: TimeLineItem, contacts: ContactDecrypted[]): Observable<TimeLineItem> {
    // remove all shared contacts
    if (!contacts || contacts.length === 0) {
      return this.updateUsers(timeLineItem.id, timeLineItem.users);
    }
    this.cacheService.resetContacts();

    return this.identityService.emitContactsToSubject()
      .switchMap(() => {
        const filteredContacts = contacts
          .filter(c => this.cacheService.getContactsMap().has(c.contactInfo.userId));
        if (filteredContacts.length === 0) {
          throw new Error('contact__not_found');
        }
        return Observable.forkJoin(filteredContacts
          .map(addedContact => {
            return this.identityService.getIdentityFromCache(addedContact.contactInfo.userId);
          }));
      })
      .switchMap((identities: Identity[]) => {
        const map = new Map();
        identities.forEach(value => {
          map.set(value.id, value.contentKey);
        });

        return this.cryptoService.share(timeLineItem.users[this.authService.getSessionUser().userId].key, map);
      })
      .switchMap(shareMap => {
        shareMap.forEach((value, key) => {
          _.extend(timeLineItem.users, {[key]: {key: value}});
        });
        return this.updateUsers(timeLineItem.id, timeLineItem.users);
      });
  }

  getSharedBy(otherId: string, responseContinuationToken?: string): Observable<TimelineResponseContinuation> {
    const memberId = this.authService.getSessionUser().userId;
    const params = new HttpHeaders().set(RESPONSE_CONTINUATION_HEADER, responseContinuationToken ? responseContinuationToken : '');
    const safeUrl = urlTemplate.parse(this.config.timelineApiHost + '/api/v1/timeline/{memberId}/sharedBy/{otherId}')
      .expand({
        memberId,
        otherId
      });
    return this.http.get<TimeLineItemEncrypted[]>(safeUrl, {headers: params, observe: 'response'})
      .switchMap((result: HttpResponse<TimeLineItemEncrypted[]>) => {
        return this.timelineService.decryptResponseContinuation(result);
      });
  }

  getSharedWith(otherId: string,
                responseContinuationToken?: string): Observable<TimelineResponseContinuation> {
    const memberId = this.authService.getSessionUser().userId;
    const params = new HttpHeaders().set(RESPONSE_CONTINUATION_HEADER, responseContinuationToken ? responseContinuationToken : '');
    const safeUrl = urlTemplate.parse(this.config.timelineApiHost + '/api/v1/timeline/{memberId}/sharedWith/{otherId}')
      .expand({
        memberId,
        otherId
      });
    return this.http.get<TimeLineItemEncrypted[]>(safeUrl, {headers: params, observe: 'response'})
      .switchMap((result: HttpResponse<TimeLineItemEncrypted[]>) => {
        return this.timelineService.decryptResponseContinuation(result);
      })
      .map((decrypted) => {
        this.timelineService.markItemsQueuedForDeletion(decrypted.timelineItems);
        return decrypted;
      });
  }

  removeSharing(otherId: string): Observable<void> {
    const memberId = this.authService.getSessionUser().userId;
    const safeUrl = urlTemplate.parse(this.config.timelineApiHost + '/api/v1/timeline/{memberId}/sharing/{otherId}')
      .expand({
        memberId,
        otherId
      });
    return this.http.delete<void>(safeUrl);
  }

  getSharedWithSubject(): BehaviorSubject<TimeLineItem[]> {
    return ShareItemService.sharedWithItemsSubject$;
  }

  pushSharedWithItemsToSubject(timeLineItems: TimeLineItem[]) {
    let resultList: TimeLineItem[];
    resultList = _.concat(ShareItemService._sharedWithItemList, timeLineItems);
    ShareItemService._sharedWithItemList = resultList;
    ShareItemService.sharedWithItemsSubject$.next(resultList);
  }

  resetSharedWithItemsSubject() {
    ShareItemService._sharedWithItemList.length = 0;
  }

  static removeDeletedTimeLineItemFromList(requestQueueEntry: RequestQueueEntry, httpCode: number, responseBody: any) {
    // check if delete timeLineItem is in current shown timeLineItem-list
    let subjectUpdateNecessary = false;
    const resultList: TimeLineItem[] = [];
    ShareItemService._sharedWithItemList.forEach((item) => {
      if (item.id === requestQueueEntry.jsonData.id) {
        subjectUpdateNecessary = true;
      } else {
        resultList.push(item);
      }
    });
    if (subjectUpdateNecessary) {
      ShareItemService._sharedWithItemList = resultList;
      ShareItemService.sharedWithItemsSubject$.next(resultList);
    }
  }

  private updateUsers(itemId: string, users: ObjectWithPermission): Observable<TimeLineItem> {
    const memberId = this.authService.getSessionUser().userId;
    const safeUrl = urlTemplate.parse(this.config.timelineApiHost + '/api/v1/timeline/{memberId}/items/{itemId}/users')
      .expand({
        memberId,
        itemId
      });
    return this.http.put<TimeLineItem>(safeUrl, users);
  }

}
