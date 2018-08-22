import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {NgbModule} from '@ng-bootstrap/ng-bootstrap';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {SharedModule} from '../shared/shared.module';
import {CoreModule} from '../core/core.module';
import {RouterModule} from '@angular/router';
import {CreateItemPageComponent} from './create-item/create-item-page.component';
import {TimelinePageComponent} from './timeline-page.component';
import {timelineRoutes} from './timeline.routing';
import {DropFileComponent} from './create-item/drop-file/drop-file.component';
import {CameraModalComponent} from './create-item/camera/camera-modal.component';
import {ListTimelinePageComponent} from './list-items/list-timeline-page.component';
import {FormErrorModule} from 'ngx-form-error';
import {TimelineViewPageResolver} from './timeline-view/timeline-view-page.resolver';
import {ZXingScannerModule} from '@zxing/ngx-scanner';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    NgbModule,
    RouterModule.forChild(timelineRoutes),
    CoreModule,
    SharedModule,
    ReactiveFormsModule,
    FormErrorModule,
    ZXingScannerModule
  ],
  entryComponents: [
    CameraModalComponent
  ],
  declarations: [
    TimelinePageComponent,
    CreateItemPageComponent,
    DropFileComponent,
    CameraModalComponent,
    ListTimelinePageComponent,
  ],
  providers: [
    TimelineViewPageResolver
  ]
})
export class TimelineModule { }
