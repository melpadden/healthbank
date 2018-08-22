import {Injectable} from '@angular/core';
import {ActivatedRouteSnapshot, Resolve, RouterStateSnapshot} from '@angular/router';
import {IdentityService} from '../../shared/contact/services/identity.service';

@Injectable()
export class ContactDetailPageResolver implements Resolve<any> {

  constructor(private identityService: IdentityService) {
  }

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    return this.identityService.getContactFromCache(route.paramMap.get('id'));
  }
}
