// This file is required by karma.conf.js and loads recursively all the .spec and framework files

import 'zone.js/dist/zone-testing';
import {getTestBed, TestBed} from '@angular/core/testing';
import {
  BrowserDynamicTestingModule,
  platformBrowserDynamicTesting
} from '@angular/platform-browser-dynamic/testing';
import { registerLocaleData } from '@angular/common';
import localeDe from '@angular/common/locales/de';
import {MediplanService} from './app/mediplan/services/mediplan.service';
import {AppModule} from './app/app.module';

// Set the locale of this application. Keep in sync with ./app/app.module.ts
registerLocaleData(localeDe);

// Unfortunately there's no typing for the `__karma__` variable. Just declare it as any.
declare const __karma__: any;
declare const require: any;

// Prevent Karma from running prematurely.
__karma__.loaded = function () {};

// First, initialize the Angular testing environment.
getTestBed().initTestEnvironment(
  BrowserDynamicTestingModule,
  platformBrowserDynamicTesting()
);

TestBed.configureTestingModule({
  providers: [MediplanService]
});

TestBed.configureTestingModule({
  imports: [AppModule]
});

// Then we find all the tests.
//const context = require.context('./', true, /\.spec\.ts$/);
const context = require.context('./', true, /\mediplan.service.spec\.ts$/);
// And load the modules.
context.keys().map(context);
// Finally, start Karma to run the tests.
// FIXME: HACK-Avoid Login for testing
// setupLogins().then(() => __karma__.start()).catch((err) => console.error('Cannot setup logins. Back-end running?', err));
__karma__.start();
