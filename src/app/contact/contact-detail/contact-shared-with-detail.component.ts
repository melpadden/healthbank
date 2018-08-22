import {Component, Input, OnDestroy, OnInit} from '@angular/core';
import {environment} from '../../../environments/environment';
import {ContactDecrypted} from '../../shared/contact/models/contact';
import {BehaviorSubject} from 'rxjs/BehaviorSubject';
import {TimeLineItem} from '../../shared/timeline/models/timeline';
import {ShareItemService} from '../../shared/timeline/services/share-item.service';
import {Subject} from 'rxjs/Subject';

@Component({
  selector: 'app-contact-shared-with-detail',
  templateUrl: './contact-shared-with-detail.component.html',
  styles: []
})
export class ContactSharedWithDetailComponent implements OnInit, OnDestroy {


  @Input() contact: ContactDecrypted;

  assets = environment.assets;
  responseContinuation: string;
  loadedItems$: BehaviorSubject<TimeLineItem[]>;
  private ngDestroy$: Subject<boolean> = new Subject<boolean>();

  constructor(private shareItemService: ShareItemService) {
  }

  ngOnInit(): void {
    this.loadedItems$ = this.shareItemService.getSharedWithSubject();
    this.shareItemService.resetSharedWithItemsSubject();
    this.responseContinuation = null;
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
    this.shareItemService.getSharedWith(this.contact.contactInfo.userId, this.responseContinuation)
      .takeUntil(this.ngDestroy$)
      .subscribe(value => {
        this.responseContinuation = value.responseContinuation;
        this.shareItemService.pushSharedWithItemsToSubject(value.timelineItems);
      });
  }
}

