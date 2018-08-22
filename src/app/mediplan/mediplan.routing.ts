import { Routes } from '@angular/router';
import { AuthRouteGuard } from '../shared/auth/guards/auth-route.guard';
import { Permission } from '../shared/auth/session/permission.enum';
import { SecuredTemplateComponent } from '../core/secured-template/secured-template.component';
import {MediplanPageComponent} from './mediplan-page.component';

export const timelineRoutes: Routes = [
  {
    path: '',
    component: SecuredTemplateComponent,
    canActivateChild: [AuthRouteGuard],
    children: [{
      path: 'mediplan',
      component: MediplanPageComponent,
      data: {
        permission: [Permission.USER_VIEW]
      }
    }]
  }
];
