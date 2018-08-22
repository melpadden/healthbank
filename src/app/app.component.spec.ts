import { async, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { AppComponent } from './app.component';
import { SharedModule } from './shared/shared.module';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { McBreadcrumbsModule } from 'ngx-breadcrumbs';
import { ENV_SETTING_TEST_PROVIDER } from './settings-loader.spec';

describe('AppComponent', () => {
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        SharedModule,
        RouterTestingModule,
        TranslateModule.forRoot(),
        McBreadcrumbsModule.forRoot(),
      ],
      declarations: [
        AppComponent
      ],
      providers: [
        TranslateService,
        ENV_SETTING_TEST_PROVIDER
      ]
    }).compileComponents();
  }));

  it('should create the app', async(() => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.debugElement.componentInstance;
    expect(app).toBeTruthy();
  }));
});
