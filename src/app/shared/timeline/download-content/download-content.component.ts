import {Component, Input, OnDestroy} from '@angular/core';
import {saveAs} from 'file-saver';
import {TimeLineItem} from '../models/timeline';
import {TimeLineService} from '../services/timeline.service';
import {AuthService} from '../../auth/auth.service';
import {IdentityService} from '../../contact/services/identity.service';
import {Identity} from '../../user/enrollment';
import {Subject} from 'rxjs/Subject';
import 'rxjs/add/operator/takeUntil';
import 'rxjs/add/operator/mergeMap';
import 'rxjs/add/operator/switchMap';
import {HttpErrorService} from '../../app-http/http-error.service';

@Component({
  selector: 'app-download-content',
  template: `
    <div class="mt-2 mb-2 text-truncate">
      <a target="_blank" (click)="$event.stopPropagation(); clickedFile();">{{timeLineItem.fileMetadata.name}}
        ({{timeLineItem.fileMetadata.size}})</a>
    </div>
  `,
  styles: []
})
export class DownloadContentComponent implements OnDestroy {

  @Input() timeLineItem: TimeLineItem;

  private ngDestroy$: Subject<boolean> = new Subject<boolean>();

  constructor(private timeLineService: TimeLineService,
              private identityService: IdentityService,
              private errorService: HttpErrorService,
              private authService: AuthService) {

  }

  ngOnDestroy(): void {
    this.ngDestroy$.next(true);
    this.ngDestroy$.complete();
  }

  clickedFile() {
    if (!this.timeLineItem || !this.timeLineItem.contentReference) {
      return;
    }
    this.identityService.getIdentityFromCache(this.timeLineItem.owner)
      .switchMap((identity: Identity) => {
        return this.timeLineService
          .getContent(this.timeLineItem.contentReference, {
            key: this.timeLineItem.users[this.authService.getSessionUser().userId].key,
            signatureKey: identity.signatureKey
          });
      })
      .takeUntil(this.ngDestroy$)
      .subscribe(
        data => this.downloadFile(data),
        err => this.errorService.processErrorToast(err)
      );
  }

  private downloadFile(data: Blob) {
    const blob = new Blob([data], {type: this.timeLineItem.fileMetadata.type});
    saveAs(blob, this.timeLineItem.fileMetadata.name);
  }
}
