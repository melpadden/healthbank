import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {NgbModule} from '@ng-bootstrap/ng-bootstrap';
import {SharedModule} from '../shared/shared.module';
import {RouterModule} from '@angular/router';
import {coreRoutes} from './core.routing';
import {SecuredTemplateComponent} from './secured-template/secured-template.component';
import {NavigationComponent} from './secured-template/navigation/navigation.component';
import {FooterComponent} from './footer/footer.component';
import {LandingPageComponent} from './landing-page/landing-page.component';
import {LoginComponent} from '../shared/auth/login/login.component';
import {NotFoundPageComponent} from './error/not-found-page.component';
import {ForbiddenPageComponent} from './error/forbidden-page.component';
import {SignUpDataComponent} from '../shared/auth/sign-up/sign-up-data.component';
import {UserSelectComponent} from '../shared/user-select/user-select-page.component';
import {FormErrorModule} from 'ngx-form-error';
import {SignUpConfirmKeyComponent} from '../shared/auth/sign-up/sign-up-confirm-key.component';
import {SignUpConfirmMailComponent} from '../shared/auth/sign-up/sign-up-confirm-mail.component';
import {ObjectKeysPipe} from '../shared/pipes/object-keys.pipe';
import {SignUpTemplateComponent} from './sign-up-template/sign-up-template.component';
import {SignUpPageComponent} from '../shared/auth/sign-up/sign-up-page.component';
import { McBreadcrumbsModule } from 'ngx-breadcrumbs';
import {HeaderComponent} from './header/header.component';
import {ZXingScannerModule} from '@zxing/ngx-scanner';


@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    NgbModule,
    RouterModule.forChild(coreRoutes),
    McBreadcrumbsModule.forRoot(),
    ReactiveFormsModule,
    SharedModule,
    FormErrorModule,
    ZXingScannerModule
  ],
  declarations: [
    FooterComponent,
    HeaderComponent,
    ForbiddenPageComponent,
    LandingPageComponent,
    LoginComponent,
    UserSelectComponent,
    SignUpDataComponent,
    SignUpPageComponent,
    SignUpConfirmKeyComponent,
    SignUpConfirmMailComponent,
    NavigationComponent,
    NotFoundPageComponent,
    SecuredTemplateComponent,
    SignUpTemplateComponent
  ],
  exports: [
    ObjectKeysPipe,
  ]
})
export class CoreModule {
}
