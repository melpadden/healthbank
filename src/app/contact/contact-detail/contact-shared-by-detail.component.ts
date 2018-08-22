import {Component, Input, OnDestroy, OnInit} from '@angular/core';
import {environment} from '../../../environments/environment';
import {ContactDecrypted} from '../../shared/contact/models/contact';
import {ShareItemService} from '../../shared/timeline/services/share-item.service';
import {TimeLineItem} from '../../shared/timeline/models/timeline';
import {BehaviorSubject} from 'rxjs/BehaviorSubject';
import 'rxjs/add/operator/takeUntil';
import {Subject} from 'rxjs/Subject';
import * as _ from 'lodash';

@Component({
  selector: 'app-contact-shared-by-detail',
  templateUrl: './contact-shared-by-detail.component.html',
  styles: []
})
export class ContactSharedByDetailComponent implements OnInit, OnDestroy {

  @Input() contact: ContactDecrypted;

  loadedItems$: BehaviorSubject<TimeLineItem[]> = new BehaviorSubject<TimeLineItem[]>([]);
  assets = environment.assets;
  responseContinuation: string;
  private ngDestroy$: Subject<boolean> = new Subject<boolean>();
  private _itemList: TimeLineItem[] = [];

  constructor(private shareItemService: ShareItemService) {
  }

  ngOnInit(): void {
    this.resetItemsSubject();
    this.loadTimelineItems();
  }

  ngOnDestroy(): void {
    this.ngDestroy$.next(true);
    this.ngDestroy$.complete();
  }

  loadMore(event: any) {
    if (!this.responseContinuation) {
      return;
    }
    this.loadTimelineItems();
  }

  loadTimelineItems() {
    this.shareItemService.getSharedBy(this.contact.contactInfo.userId, this.responseContinuation)
      .takeUntil(this.ngDestroy$)
      .subscribe(value => {
        this.responseContinuation = value.responseContinuation;
        this.pushItemsToSubject(value.timelineItems);
      });
  }

  private pushItemsToSubject(timeLineItems: TimeLineItem[]) {
    let resultList: TimeLineItem[];
    resultList = _.concat(this._itemList, timeLineItems);
    this._itemList = resultList;
    this.loadedItems$.next(resultList);
  }

  private resetItemsSubject() {
    this._itemList.length = 0;
    this.responseContinuation = null;
  }
}
