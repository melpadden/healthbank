import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {NgbModule} from '@ng-bootstrap/ng-bootstrap';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {SharedModule} from '../shared/shared.module';
import {CoreModule} from '../core/core.module';
import {RouterModule} from '@angular/router';
import {LoadMediplanPageComponent} from './load-mediplan/load-mediplan-page.component';
import {timelineRoutes} from './mediplan.routing';
import {MediplanService} from './services/mediplan.service';
import {MediplanPageComponent} from './mediplan-page.component';
import {ZXingScannerModule} from '@zxing/ngx-scanner';
import {PdfViewerModule} from 'ng2-pdf-viewer';
import { ModalDialogModule } from 'ngx-modal-dialog';
import {DownloadDataComponent} from  '../shared/components/download/download-data.component'

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    NgbModule,
    RouterModule.forChild(timelineRoutes),
    CoreModule,
    SharedModule,
    FormsModule,
    ReactiveFormsModule,
    ZXingScannerModule,
    PdfViewerModule,
    ModalDialogModule.forRoot()
  ],
  declarations: [
    MediplanPageComponent,
    LoadMediplanPageComponent,
  ],
  providers: [
    MediplanService
  ]
})
export class MediplanModule {
}
