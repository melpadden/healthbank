import {Component, OnInit} from '@angular/core';
import {NgbActiveModal, NgbModalOptions} from '@ng-bootstrap/ng-bootstrap';
import {TranslateService} from '@ngx-translate/core';
import {TimeLineItem} from '../models/timeline';
import {environment} from '../../../../environments/environment';

@Component({
  selector: 'app-delete-timeline-item-dialog',
  templateUrl: 'delete-timeline-item-modal.component.html'
})
export class DeleteTimelineItemDialogComponent implements OnInit {

  assets = environment.assets;
  private timelineItem: TimeLineItem;

  public static getModalOptions(): NgbModalOptions {
    return {
      size: 'lg'
    };
  }

  constructor(public activeModal: NgbActiveModal,
              private translate: TranslateService) {
  }

  ngOnInit() {

  }

  onConfirm() {
    this.activeModal.close();
  }

  initDeleteDialog(item: TimeLineItem) {
    this.timelineItem = item;

  }

  getCount() {
    return Object.keys(this.timelineItem.users).length - 1;
  }

  // private fillModalTranslations() {
  //   this.translate.get('timelineViewPage.deleteModal.title').subscribe((translation) => {
  //     this.modalTranslations['title'] = translation;
  //   });
  //   this.translate.get('timelineViewPage.deleteModal.message').subscribe((translation) => {
  //     this.modalTranslations['message'] = translation;
  //   });
  //   this.translate.get('timelineViewPage.deleteModal.note',
  //     {sharedCount: Object.keys(this.timelineItem.users).length - 1}).subscribe((translation) => {
  //     this.modalTranslations['note'] = translation;
  //   });
  //   this.translate.get('timelineViewPage.deleteModal.cancelLabel').subscribe((translation) => {
  //     this.modalTranslations['cancelLabel'] = translation;
  //   });
  //   this.translate.get('timelineViewPage.deleteModal.confirmLabel').subscribe((translation) => {
  //     this.modalTranslations['confirmLabel'] = translation;
  //   });
  // }

}
