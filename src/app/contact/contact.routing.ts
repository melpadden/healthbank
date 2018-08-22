import {Routes} from '@angular/router';
import {AuthRouteGuard} from '../shared/auth/guards/auth-route.guard';
import {SecuredTemplateComponent} from '../core/secured-template/secured-template.component';
import {ContactListPageComponent} from './contact-list/contact-list-page.component';
import {ContactDetailPageComponent} from './contact-detail/contact-detail-page.component';
import {ContactDetailPageResolver} from './contact-detail/contact-detail-page.resolver';
import {ContactTimelineViewPageResolver} from './timeline-detail/contact-timeline-view-page.resolver';
import {ContactTimelineDetailBreadcrumbResolver} from './timeline-detail/contact-timeline-detail-breadcrumb.resolver';
import {TimelineViewPageComponent} from '../shared/timeline/detail/timeline-view-page.component';

export const contactRoutes: Routes = [
  {
    path: '',
    component: SecuredTemplateComponent,
    canActivateChild: [AuthRouteGuard],
    children: [
      {
        path: 'contacts',
        data: {
          breadcrumbs: 'contacts.breadcrumb.contacts'
        },
        children: [
          {
            path: '',
            component: ContactListPageComponent,
          },
          {
            path: 'detail/:id',
            resolve: {
              contact: ContactDetailPageResolver
            },
            data: {
              breadcrumbs: ContactTimelineDetailBreadcrumbResolver,
            },
            children: [
              {
                path: '',
                component: ContactDetailPageComponent,
              },
              {
                path: 'item/:id',
                component: TimelineViewPageComponent,
                data: {
                  breadcrumbs: '{{ timeLineItem.metadata.title }}'
                },
                resolve: {
                  timeLineItem: ContactTimelineViewPageResolver
                },
              }
            ]
          },
        ]
      }
    ]
  }
];

