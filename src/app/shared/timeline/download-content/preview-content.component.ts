import {Component, Input, OnDestroy, OnInit} from '@angular/core';
import {DomSanitizer} from '@angular/platform-browser';
import {TimeLineItem} from '../models/timeline';
import {environment} from '../../../../environments/environment';
import {TimeLineService} from '../services/timeline.service';
import {AuthService} from '../../auth/auth.service';
import {IdentityService} from '../../contact/services/identity.service';
import {Observable} from 'rxjs/Observable';
import 'rxjs/add/observable/if';
import 'rxjs/add/operator/switchMap';
import {Subject} from 'rxjs/Subject';

@Component({
  selector: 'app-preview-content',
  template: `
    <div class="preview-border" [style.width]="width" [style.height]="height">
      <img [src]="imageToPreview" alt="Place image title" class="img-thumbnail"
           [style.max-width]="width"
           [style.max-height]="height"
           *ngIf="imageToPreview; else loading">
      <ng-template #loading>
        <div class="preview-loading img-thumbnail" [style.width]="width" [style.height]="height">
          <div class="spinner"></div>
        </div>
      </ng-template>
    </div>
  `,
  styleUrls: ['./preview-content.component.scss']
})
export class PreviewContentComponent implements OnInit, OnDestroy {

  @Input() content: Blob;
  @Input() timeLineItem: TimeLineItem;
  @Input() width = '150px';
  @Input() height = '100px';
  assets = environment.assets;
  imageToPreview: any;
  private ngDestroy$: Subject<boolean> = new Subject<boolean>();

  constructor(private timeLineService: TimeLineService,
              private domSanitizer: DomSanitizer,
              private identityService: IdentityService,
              private authService: AuthService) {
  }

  ngOnDestroy(): void {
    this.ngDestroy$.next(true);
    this.ngDestroy$.complete();
  }

  ngOnInit(): void {
    if (this.timeLineItem) {
      if (this.timeLineItem.thumbnail) {
        this.createImageFromBlob(this.timeLineItem.thumbnail);
      } else if (this.timeLineItem.id && this.timeLineItem.thumbnailReference && !this.timeLineItem.markedForDeletion) {
          Observable.if(() => this.timeLineItem.owner === this.authService.getSessionUser().userId,
            Observable.of(null),
            this.identityService.getIdentityFromCache(this.timeLineItem.owner).map(value => value.signatureKey)
          ).switchMap(signatureKey => {
            return this.timeLineService.getContent(this.timeLineItem.thumbnailReference,
              {
                key: this.timeLineItem.users[this.authService.getSessionUser().userId].key,
                signatureKey: signatureKey
              });
          }).takeUntil(this.ngDestroy$)
            .subscribe(data => {
              this.createImageFromBlob(data);
            }
          );
      }
    } else if (this.content) {
      this.createImageFromBlob(this.content);
    }
  }

  createImageFromBlob(image: any) {
    const reader = new FileReader();
    reader.addEventListener('load', () => {
      this.imageToPreview = this.domSanitizer.bypassSecurityTrustUrl(reader.result);
    }, false);

    if (image) {
      reader.readAsDataURL(image);
    }
  }
}
