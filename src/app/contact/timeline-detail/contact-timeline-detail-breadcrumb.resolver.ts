import {Injectable} from '@angular/core';
import {ActivatedRouteSnapshot, RouterStateSnapshot} from '@angular/router';
import {IBreadcrumb, McBreadcrumbsResolver} from 'ngx-breadcrumbs';
import {Observable} from 'rxjs/Observable';
import {IdentityService} from '../../shared/contact/services/identity.service';

/**
 * Special resolver for the Breadcrumb of contact details.
 */
@Injectable()
export class ContactTimelineDetailBreadcrumbResolver extends McBreadcrumbsResolver {

  constructor(private identityService: IdentityService) {
    super();
  }

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<IBreadcrumb[]> | Promise<IBreadcrumb[]> | IBreadcrumb[] {
    if (!route.data.contact || !route.data.contact.userId) {
      return this.identityService.getContactFromCache(route.paramMap.get('id')).map(contact => {
        return [{
          text: contact.contactInfo.firstname + ' ' + contact.contactInfo.lastname,
          path: super.getFullPath(route),
        }];
      });
    }
    return Observable.of([{
      text: route.data.contact.contactInfo.firstname + ' ' + route.data.contact.contactInfo.lastname,
      path: super.getFullPath(route),
    }]);
  }

  getFullPath(route: ActivatedRouteSnapshot): string {
    return route.outlet;
  }
}
