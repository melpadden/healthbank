import {Component, OnInit, TemplateRef, ViewChild} from '@angular/core';
import {InitService} from './shared/init.service';
import {RESPONSE_ERROR_MESSAGES} from './shared/app-http/error-msgs';
import {ErrorTemplateContext, FormErrorConfig} from 'ngx-form-error';
import {TranslateService} from '@ngx-translate/core';
import {McBreadcrumbsConfig} from 'ngx-breadcrumbs';
import {ZXingScannerComponent, ZXingScannerModule} from '@zxing/ngx-scanner';

@Component({
  selector: 'app-root',
  template: `
    <router-outlet></router-outlet>

    <ng-template #customErrorTemplate let-errors="errors">
      <div *ngFor="let error of errors; let i = index" class="error-message">
        <div *ngIf="i === 0">
          {{error.message}}
        </div>
      </div>
    </ng-template>
  `
})
export class AppComponent implements OnInit {

  private static _availableLangs = ['en', 'de'];
  @ViewChild('customErrorTemplate') errorTemplate: TemplateRef<ErrorTemplateContext>;

  constructor(private initService: InitService,
              private formErrorConfig: FormErrorConfig,
              private translate: TranslateService,
              private breadcrumbsConfig: McBreadcrumbsConfig) {

    this.initLanguage();
    this.initFormErrorConfig();
    this.initBreadCrumbs();

  }

  ngOnInit() {
    this.initService.commonResponseErrors(RESPONSE_ERROR_MESSAGES);
    this.formErrorConfig.setTemplate(this.errorTemplate);
  }

  private initLanguage() {
    this.translate.addLangs(AppComponent._availableLangs);
    this.translate.setDefaultLang('en');
    let browserLang = this.translate.getDefaultLang();
    try {
      browserLang = this.translate.getBrowserLang();
    } catch (e) {
      browserLang = this.translate.getDefaultLang();
    }
    AppComponent._availableLangs.includes(browserLang) ?
      this.translate.use(browserLang) :
      this.translate.use(this.translate.getDefaultLang());
  }

  private initFormErrorConfig() {
    this.translate.get('common.formErrors.required').subscribe(
      (message) => this.formErrorConfig.updateMessages({required: message}));
    this.translate.stream(
      ['common.formErrors.ngbDate', 'common.formErrors.ngbDate.requireAfter', 'common.formErrors.ngbDate.requireBefore'])
      .subscribe((message) => {
        this.formErrorConfig.updateMessages({
          ngbDate: ((error) => {
            if (error.requiredBefore) {
              return message['common.formErrors.ngbDate.requireBefore'];
            }
            if (error.requiredAfter) {
              return message['common.formErrors.ngbDate.requireAfter'];
            }
            return message['common.formErrors.ngbDate'];
          })
        });
      });
    this.translate.get('common.formErrors.time').subscribe(
      (message) => this.formErrorConfig.updateMessages({time: message}));
    this.translate.get('common.formErrors.phone').subscribe(
      (message) => this.formErrorConfig.updateMessages({phone: message}));
    this.translate.get('common.formErrors.email').subscribe(
      (message) => this.formErrorConfig.updateMessages({email: message}));
    this.translate.get('common.formErrors.maxlength').subscribe(
      (message) => this.formErrorConfig.updateMessages({maxlength: message}));
    this.translate.get('signup.enterActivationCode.maxlength', {param: '8'}).subscribe(
      (message) => this.formErrorConfig.updateMessages({maxlength: message}));
    this.translate.get('signup.enterActivationCode.minlength', {param: '8'}).subscribe(
      (message) => this.formErrorConfig.updateMessages({minlength: message}));
    this.translate.get('common.formErrors.terms.and.conditions').subscribe(
      (message) => this.formErrorConfig.updateMessages({terms: message}));
    this.translate.get('common.formErrors.pwdSame').subscribe(
      (message) => this.formErrorConfig.updateMessages({pwdSame: message}));
    this.translate.get('common.formErrors.invitation__not_found').subscribe(
      (message) => this.formErrorConfig.updateMessages({invitation__not_found: message}));
    this.translate.get('common.formErrors.default_error').subscribe(
      (message) => this.formErrorConfig.updateMessages({default_error: message}));
  }

  private initBreadCrumbs() {
    this.breadcrumbsConfig.postProcess = (breadcrumbs) => {
      if (breadcrumbs && breadcrumbs.length > 0) {
        breadcrumbs.map(crumb => {
          this.translate.get(crumb.text).subscribe((message) => {
            if (message) {
              crumb.text = message;
            }
          });
        });
      }
      return breadcrumbs;
    };
  }
}
