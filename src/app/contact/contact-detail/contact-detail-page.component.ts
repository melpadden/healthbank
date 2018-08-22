import {Component, OnInit} from '@angular/core';
import {environment} from '../../../environments/environment';
import {ActivatedRoute, ParamMap, Params, Router} from '@angular/router';
import {AuthService} from '../../shared/auth/auth.service';
import 'rxjs/add/operator/switchMap';
import {NgbModal, NgbTabChangeEvent} from '@ng-bootstrap/ng-bootstrap';
import {ToastService} from '../../shared/toast/toast.service';
import {ContactDecrypted, SharedInformation} from '../../shared/contact/models/contact';
import {ContactService} from '../../shared/contact/services/contact.service';
import {IdentityService} from '../../shared/contact/services/identity.service';
import {Identity} from '../../shared/user/enrollment';
import {Observable} from 'rxjs/Observable';
import {ShareItemService} from '../../shared/timeline/services/share-item.service';
import {HttpErrorService} from '../../shared/app-http/http-error.service';
import {ContactDeleteDialogComponent} from '../contact-delete/contact-delete.component';
import 'rxjs/add/observable/concat';


@Component({
  selector: 'app-contact-detail-page',
  templateUrl: './contact-detail-page.component.html'
})
export class ContactDetailPageComponent implements OnInit {

  assets = environment.assets;
  contact: ContactDecrypted;
  identity: Identity;
  activeTabId = 'hasAccessTab-id';
  sharedInformation: SharedInformation;


  constructor(private route: ActivatedRoute,
              private router: Router,
              private errorService: HttpErrorService,
              private contactService: ContactService,
              private identityService: IdentityService,
              private authService: AuthService,
              private sharingService: ShareItemService,
              private toastService: ToastService,
              private modalService: NgbModal) {
  }

  ngOnInit() {
    this.route.queryParamMap
      .subscribe((value: ParamMap) => {
        if (value.has('tab')) {
          this.activeTabId = value.get('tab');
        }
      });
    this.route.data
      .map(data => {
        return data.contact;
      })
      .flatMap((item: ContactDecrypted) => {
        this.contact = item;
        if (!this.contact || !this.contact.contactInfo) {
          return Observable.throw(new Error('contact-not-found'));
        }
        return this.identityService
          .getContactSharedInformations([this.contact.contactInfo.userId], this.authService.getSessionUser().userId)
          .switchMap(value => {
            if (value) {
              this.sharedInformation = value[this.contact.contactInfo.userId];
            }
            return this.identityService.getIdentityFromCache(this.contact.contactInfo.userId);
          });
      })
      .subscribe((identity: Identity) => {
        this.identity = identity;
      }, error2 => {
        this.router.navigate(['/contacts']);
      });
  }

  openDeleteConfirmDialog() {
    const modalRef = this.modalService.open(ContactDeleteDialogComponent);
    modalRef.componentInstance.contact = this.contact;
    modalRef.result
      .then(() => {
        this.identityService.removeContact(this.contact.invitationId, this.contact.contactInfo.userId)
          .concat(this.sharingService.removeSharing(this.contact.contactInfo.userId))
          .subscribe(() => {
            this.toastService.success('contactDetailPage.toast.delete.message',
              'contactDetailPage.toast.delete.title', true);
            this.router.navigate(['/contacts']);
          }, error => {
            this.errorService.processErrorToast(error);
          });
      }).catch(() => {
      // do nothing
    });
  }

  beforeTabChange($event: NgbTabChangeEvent) {
    const queryParams: Params = Object.assign({}, this.route.snapshot.queryParams);
    queryParams['tab'] = $event.nextId;
    this.router.navigate([], {relativeTo: this.route, queryParams: queryParams});
  }

}
