import {Routes} from '@angular/router';
import {AuthRouteGuard} from '../shared/auth/guards/auth-route.guard';
import {Permission} from '../shared/auth/session/permission.enum';
import {SecuredTemplateComponent} from '../core/secured-template/secured-template.component';
import {TimelinePageComponent} from './timeline-page.component';
import {CreateItemPageComponent} from './create-item/create-item-page.component';
import {TimelineViewPageComponent} from '../shared/timeline/detail/timeline-view-page.component';
import {TimelineViewPageResolver} from './timeline-view/timeline-view-page.resolver';

export const timelineRoutes: Routes = [
  {
    path: '',
    component: SecuredTemplateComponent,
    canActivateChild: [AuthRouteGuard],
    children: [
      {
        path: 'timeline',
        data: {
          permission: [Permission.USER_VIEW],
          breadcrumbs: 'timeline.breadcrumb.timeline'
        },
        children: [
          {
            path: '',
            component: TimelinePageComponent
          },
          {
            path: 'item/:id',
            component: TimelineViewPageComponent,
            data: {
              permission: [Permission.USER_VIEW],
              breadcrumbs: '{{ timeLineItem.metadata.title }}'
            },
            resolve: {
              timeLineItem: TimelineViewPageResolver
            }
          },
          {
            path: 'addData',
            component: CreateItemPageComponent,
            data: {
              permission: [Permission.USER_VIEW],
              breadcrumbs: 'timeline.breadcrumb.timeline.add.data'
            }
          }
        ]
      }
    ]
  }
];
