import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {Observable} from 'rxjs/Observable';
import {ActivatedRoute, Router} from '@angular/router';
import 'rxjs/add/operator/switchMap';
import {environment} from '../../../../environments/environment';
import {TimeLineItem} from '../models/timeline';
import {TimeLineService} from '../services/timeline.service';
import {AuthService} from '../../auth/auth.service';
import {RequestQueueService} from '../../request-queue/request-queue.service';
import {NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {IdentityService} from '../../contact/services/identity.service';
import {ContactDecrypted} from '../../contact/models/contact';
import 'rxjs/add/operator/map';

@Component({
  selector: 'app-list-timeline',
  templateUrl: 'list-timeline.component.html',
  styleUrls: ['list-timeline.component.scss']
})
export class ListTimelineComponent implements OnInit {

  assets = environment.assets;
  @Input() loadedItems$: Observable<Array<TimeLineItem>>;
  @Input() showMoreToken: string;
  @Output() loadMoreItems = new EventEmitter();
  searchCollapsed = true;
  private contacts$: Observable<ContactDecrypted[]>;

  constructor(private timeLineService: TimeLineService,
              public authService: AuthService,
              private modalService: NgbModal,
              public route: ActivatedRoute,
              public router: Router,
              private identityService: IdentityService,
              private requestQueueService: RequestQueueService) {
  }

  ngOnInit() {
    if (this.loadedItems$) {
      this.loadedItems$ = this.loadedItems$.map((value: TimeLineItem[]) => {
        return value.map(item => {
          const tmp = item;
          tmp['signature'] = Observable.of('?');
          if (item.owner === this.authService.getSessionUser().userId) {
            tmp['signature'] = Observable.of(this.authService.getSessionUser().user.firstName.slice(0, 1).toUpperCase() +
              this.authService.getSessionUser().user.lastName.slice(0, 1).toUpperCase());
          } else {
            tmp['signature'] = this.identityService.getContactFromCache(item.owner)
              .map(contact => {
                return contact.contactInfo.firstname.slice(0, 1).toUpperCase() +
                  contact.contactInfo.firstname.slice(0, 1).toUpperCase();
              });
          }
          return tmp;
        });
      });
    }
    this.contacts$ = this.identityService.getContactsSubject();
    this.identityService.loadContactsSubject();
  }

  hasUploadQueueState(item: TimeLineItem): boolean {
    return (item.requestQueueId !== null && item.requestQueueId !== undefined);
  }

  getUploadQueueState(item: TimeLineItem): string {
    const queueState = this.requestQueueService.getRequestState(item.requestQueueId);
    if (queueState === null) {
      return 'error';
    } else if (queueState.state === 'transferring') {
      return `${queueState.percentProcessed}%`;
    } else {
      return queueState.state;
    }
  }

  loadMore(token: string) {
    this.loadMoreItems.emit();
  }

  itemClicked(item: TimeLineItem) {
    this.router.navigate([`./item`, item.id], {relativeTo: this.route, queryParams: {reference: item.reference}});
  }

  deletedItemClicked(event: Event) {
    event.stopPropagation();
  }

  queuedItemClicked(event: Event) {
    event.stopPropagation();
  }

  getSharedUsersCount(item: TimeLineItem) {
    if (!item || !item.users || Object.keys(item.users).length === 0) {
      return 0;
    }
    return Object.keys(item.users).length - 1;
  }
}
