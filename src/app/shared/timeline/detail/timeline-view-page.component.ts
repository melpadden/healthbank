import {Component, OnDestroy, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {TimeLineService} from '../services/timeline.service';
import {TimeLineItem} from '../models/timeline';
import {NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {ToastService} from '../../toast/toast.service';
import {Subject} from 'rxjs/Subject';
import 'rxjs/add/operator/takeUntil';
import {BehaviorSubject} from 'rxjs/BehaviorSubject';
import {ContactDecrypted} from '../../contact/models/contact';
import {AuthService} from '../../auth/auth.service';
import {DeleteTimelineItemDialogComponent} from '../delete-modal/delete-timeline-item-modal.component';

@Component({
  selector: 'app-timeline-view-page',
  templateUrl: './timeline-view-page.component.html',
  styles: []
})
export class TimelineViewPageComponent implements OnInit, OnDestroy {

  timelineItem: TimeLineItem;
  sharedContacts: BehaviorSubject<ContactDecrypted[]> = new BehaviorSubject<ContactDecrypted[]>([]);
  private ngDestroy$: Subject<boolean> = new Subject<boolean>();

  constructor(private route: ActivatedRoute,
              private router: Router,
              private timeLineService: TimeLineService,
              private toastService: ToastService,
              private modalService: NgbModal,
              public authService: AuthService) {
  }

  ngOnInit() {
    this.route.data.map(data => data.timeLineItem)
      .takeUntil(this.ngDestroy$)
      .subscribe((item) => {
        this.timelineItem = item;
      });
  }

  ngOnDestroy(): void {
    this.ngDestroy$.next(true);
    this.ngDestroy$.complete();
  }

  openDeleteConfirmDialog(item: TimeLineItem) {
    const modalRef = this.modalService.open(DeleteTimelineItemDialogComponent);
    modalRef.componentInstance.initDeleteDialog(item);
    modalRef.result
      .then(() => {
        this.timeLineService.deleteItem(item.owner, item.id);
        this.toastService.success('timelineView.toast.delete.message',
          'timelineView.toast.delete.title', true);
        this.router.navigate(['../../'], {relativeTo: this.route});
      }).catch(() => {
      // do nothing
    });
  }
}
