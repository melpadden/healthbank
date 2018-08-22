import {LandingPageComponent} from './landing-page/landing-page.component';
import {Routes} from '@angular/router';
import {ForbiddenPageComponent} from './error/forbidden-page.component';
import {NotFoundPageComponent} from './error/not-found-page.component';
import {RedirectAuthGuard} from '../shared/auth/guards/redirect-auth.guard';
import {SignUpRouteGuard} from '../shared/auth/guards/sign-up-route.guard';
import {SignUpPageComponent} from '../shared/auth/sign-up/sign-up-page.component';
import {SignUpTemplateComponent} from './sign-up-template/sign-up-template.component';

export const coreRoutes: Routes = [
  {
    path: '403',
    component: ForbiddenPageComponent
  },
  {
    path: '404',
    component: NotFoundPageComponent
  },
  {
    path: '',
    component: LandingPageComponent,
    canActivate: [RedirectAuthGuard]
  },
  {
    path: '',
    component: SignUpTemplateComponent,
    canActivate: [RedirectAuthGuard],
    canActivateChild: [SignUpRouteGuard],
    children: [{
      path: 'signup',
      component: SignUpPageComponent
    }]
  },
];
