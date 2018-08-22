import {ErrorHandler, NgModule} from '@angular/core';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {CommonModule} from '@angular/common';
import {RedirectAuthGuard} from './auth/guards/redirect-auth.guard';
import {AuthRouteGuard} from './auth/guards/auth-route.guard';
import {NgbModule} from '@ng-bootstrap/ng-bootstrap';
import {ListChromeComponent} from './components/list-chrome/list-chrome.component';
import {TableComponent} from './components/table/table.component';
import {ConfirmDialogComponent} from './components/dialog/confirm.component';
import {DateFormatPipe} from './date/date-format.pipe';
import {DateTimeFormatPipe} from './date/date-time-format.pipe';
import {LoadingSpinnerComponent} from './components/loading-spinner/loading-spinner.component';
import {AuthService} from './auth/auth.service';
import {defaultToastConfig, ToastService} from './toast/toast.service';
import {ToastrModule} from 'ngx-toastr';
import {TechnicalErrorComponent} from './app-http/technical-error/technical-error.component';
import {HttpErrorService} from './app-http/http-error.service';
import {VersionService} from './version/version.service';
import {DatePickerComponent} from './date/date-picker.component';
import {TechnicalErrorInterceptor} from './app-http/technical-error.interceptor';
import {HTTP_INTERCEPTORS, HttpClientModule} from '@angular/common/http';
import {RuntimeErrorHandlerService} from './error-handle/runtime-error-handler.service';
import {FormErrorModule} from 'ngx-form-error';
import {AmountPipe} from './components/amount-input/amount.pipe';
import {AmountInputComponent} from './components/amount-input/amount-input.component';
import {TimeFormatDirective} from './date/time-format.directive';
import {TagInputComponent, TagInputDropdown, TagInputModule} from 'ngx-chips';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {BrowserModule} from '@angular/platform-browser';
import {FileComponent, FileDropModule} from 'ngx-file-drop';
import {WebCamComponent, WebCamModule} from 'ack-angular-webcam';
import {AckMediaDevices} from 'ack-angular-webcam/AckMediaDevices.directive';
import {InitService} from './init.service';
import {RequestQueueService} from './request-queue/request-queue.service';
import {RequestQueueStateComponent} from './request-queue/request-queue-state.component';
import {TranslateModule, TranslatePipe, TranslateService} from '@ngx-translate/core';
import {UserService} from './user/user.service';
import {SignUpRouteGuard} from './auth/guards/sign-up-route.guard';
import {ObjectKeysPipe} from './pipes/object-keys.pipe';
import {PhoneFormatDirective} from './formatings/phone-format.directive';
import {CryptoService} from './crypto/crypto.service';
import {RequestAuthInterceptor} from './app-http/request-auth.interceptor';
import {ListTimelineComponent} from './timeline/list/list-timeline.component';
import {PreviewContentComponent} from './timeline/download-content/preview-content.component';
import {DownloadContentComponent} from './timeline/download-content/download-content.component';
import {TimeLineService} from './timeline/services/timeline.service';
import {PluralPipe} from './translation/plural.pipe';
import {IdentityService} from './contact/services/identity.service';
import {ContactService} from './contact/services/contact.service';
import {ShareItemModalComponent} from './timeline/list/share-item-modal.component';
import {ShareItemService} from './timeline/services/share-item.service';
import {TimelineViewComponent} from './timeline/detail/timeline-view.component';
import {CacheService} from './cache/cache.service';
import {ShareItemDirective} from './timeline/share-item/share-item.directive';
import {DeleteTimelineItemDialogComponent} from './timeline/delete-modal/delete-timeline-item-modal.component';
import {TimelineViewPageComponent} from './timeline/detail/timeline-view-page.component';
import {CryptoItemService} from './crypto/crypto-item.service';
import {LoginService} from './auth/login.service';
import {CryptoServiceSupport} from './crypto/crypto.service.support';
import {QrScannerComponent} from './qr/qr-scanner.component';
import {ZXingScannerComponent, ZXingScannerModule} from '@zxing/ngx-scanner';
import {BrowserQRCodeReader, VideoInputDevice, Result } from '@zxing/library';
import {QrService} from './qr/qr.service';
import {DownloadDataComponent} from './components/download/download-data.component';


@NgModule({
  imports: [
    CommonModule,
    FormErrorModule.forRoot(),
    FormsModule,
    HttpClientModule,
    NgbModule,
    ReactiveFormsModule,
    ToastrModule.forRoot(defaultToastConfig),
    BrowserModule,
    BrowserAnimationsModule,
    FormsModule,
    TagInputModule,
    FileDropModule,
    WebCamModule,
    TranslateModule.forRoot(),
    ZXingScannerModule
  ],
  declarations: [
    AmountPipe,
    AmountInputComponent,
    ConfirmDialogComponent,
    DateFormatPipe,
    DatePickerComponent,
    DateTimeFormatPipe,
    PluralPipe,
    ListChromeComponent,
    ListTimelineComponent,
    PreviewContentComponent,
    DownloadContentComponent,
    LoadingSpinnerComponent,
    ObjectKeysPipe,
    PhoneFormatDirective,
    RequestQueueStateComponent,
    ShareItemModalComponent,
    TableComponent,
    TechnicalErrorComponent,
    TimeFormatDirective,
    ShareItemDirective,
    TimelineViewComponent,
    TimelineViewPageComponent,
    DeleteTimelineItemDialogComponent,
    QrScannerComponent,
    DownloadDataComponent,
  ],
  entryComponents: [
    TechnicalErrorComponent,
    ConfirmDialogComponent,
    ShareItemModalComponent,
    DeleteTimelineItemDialogComponent
  ],
  providers: [
    AuthRouteGuard,
    AuthService,
    LoginService,
    CacheService,
    HttpErrorService,
    RedirectAuthGuard,
    SignUpRouteGuard,
    ToastService,
    TimeLineService,
    VersionService,
    InitService,
    RequestQueueService,
    UserService,
    TranslateService,
    CryptoService,
    CryptoServiceSupport,
    ContactService,
    IdentityService,
    CryptoItemService,
    ShareItemService,
    QrService,
    {
      provide: HTTP_INTERCEPTORS,
      useClass: RequestAuthInterceptor,
      multi: true,
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: TechnicalErrorInterceptor,
      multi: true,
    },
    {provide: ErrorHandler, useClass: RuntimeErrorHandlerService},
  ],
  exports: [
    AmountPipe,
    ObjectKeysPipe,
    AmountInputComponent,
    ConfirmDialogComponent,
    DateFormatPipe,
    DatePickerComponent,
    DateTimeFormatPipe,
    ListChromeComponent,
    ListTimelineComponent,
    PreviewContentComponent,
    DownloadContentComponent,
    LoadingSpinnerComponent,
    ShareItemModalComponent,
    TableComponent,
    TechnicalErrorComponent,
    TechnicalErrorComponent,
    TimeFormatDirective,
    PhoneFormatDirective,
    ShareItemDirective,
    TagInputComponent,
    TagInputDropdown,
    FileComponent,
    WebCamComponent,
    AckMediaDevices,
    RequestQueueStateComponent,
    TranslatePipe,
    PluralPipe,
    TimelineViewComponent,
    TimelineViewPageComponent,
    DeleteTimelineItemDialogComponent,
    QrScannerComponent,
    DownloadDataComponent,
  ],
})
export class SharedModule {
}
