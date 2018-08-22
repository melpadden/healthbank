import { BrowserModule } from '@angular/platform-browser';
import { CommonModule } from '@angular/common';
import { APP_INITIALIZER, NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AppComponent } from './app.component';
import { SharedModule } from './shared/shared.module';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { CoreModule } from './core/core.module';
import { appRoutes } from './app.routing';
import { RouterModule } from '@angular/router';
import { NgbActiveModal, NgbDateParserFormatter, NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { DateFormatter } from './shared/date/date-picker.component';
import { registerLocaleData } from '@angular/common';
import localeDe from '@angular/common/locales/de';
import { TimelineModule } from './timeline/timeline.module';
import './shared/rxjs-operators';
import { UserModule } from './user/user.module';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { environment } from '../environments/environment';
import { ContactModule } from './contact/contact.module';
import { ENV_SETTINGS_TOKEN, envSettingsFactory, loadEnvSettings } from './settings-loader';
import {MediplanModule} from './mediplan/mediplan-module';
import {ZXingScannerModule} from '@zxing/ngx-scanner';
import {MediplanService} from './mediplan/services/mediplan.service';
import {QrService} from './shared/qr/qr.service';

// Set the locale of this application. Keep in sync with ../test.ts
registerLocaleData(localeDe);

@NgModule({
  declarations: [
    AppComponent,
  ],
  imports: [
    // library imports
    BrowserModule,
    CommonModule,
    BrowserAnimationsModule,
    FormsModule,
    NgbModule.forRoot(),
    HttpClientModule,
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: (createTranslateLoader),
        deps: [HttpClient]
      }
    }),

    // app modules
    CoreModule,
    SharedModule,
    TimelineModule,
    ContactModule,
    UserModule,
    MediplanModule,
    ZXingScannerModule,


    // main routing - must be last, as the not found path will hide all following route definitions
    RouterModule.forRoot(appRoutes, {useHash: true})
  ],
  providers: [
    {
      provide: NgbDateParserFormatter,
      useClass: DateFormatter
    },
    NgbActiveModal,    {
      provide: APP_INITIALIZER,
      useFactory: loadEnvSettings,
      multi: true,
      deps: [HttpClient]
    },
    {
      provide: ENV_SETTINGS_TOKEN,
      useFactory: envSettingsFactory
    },
    MediplanService,
    QrService
  ],
  bootstrap: [AppComponent],
})
export class AppModule {
}

// required for AOT compilation
export function createTranslateLoader(httpClient: HttpClient) {
  const now = new Date().getTime();
  return new TranslateHttpLoader(httpClient, environment.assets + '/i18n/', '.json?t=' + now);
}

