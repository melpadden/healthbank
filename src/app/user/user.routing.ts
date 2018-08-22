import { Routes } from '@angular/router';
import { AuthRouteGuard } from '../shared/auth/guards/auth-route.guard';
import { Permission } from '../shared/auth/session/permission.enum';
import { SecuredTemplateComponent } from '../core/secured-template/secured-template.component';
import { ProfilePageComponent } from './profile/profile-page.component';

export const userRoutes: Routes = [
  {
    path: '',
    component: SecuredTemplateComponent,
    canActivateChild: [AuthRouteGuard],
    children: [
      {
        path: 'user/profile',
        component: ProfilePageComponent,
        data: {
          permission: [Permission.USER_VIEW],
          breadcrumbs: 'timeline.breadcrumb.profile',
        }
      },
    ]
  }
];
