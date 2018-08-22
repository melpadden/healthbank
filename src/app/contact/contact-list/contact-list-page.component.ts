import {Component, OnInit} from '@angular/core';
import {Observable} from 'rxjs/Observable';
import {environment} from '../../../environments/environment';
import {ActivatedRoute, Router} from '@angular/router';
import {AuthService} from '../../shared/auth/auth.service';
import 'rxjs/add/operator/switchMap';
import {NgbModal, NgbModalRef} from '@ng-bootstrap/ng-bootstrap';
import {AddContactModalSuccessComponent} from '../add-contact/add-contact-modal-success.component';
import {AddContactChooseModalComponent} from '../add-contact/add-contact-choose-modal.component';
import {AddContactCreateKeyModalComponent} from '../add-contact/add-contact-create-key-modal.component';
import {AddContactEnterKeyModalComponent} from '../add-contact/add-contact-enter-key-modal.component';
import {ContactDecrypted, InvitationDB} from '../../shared/contact/models/contact';
import {ContactService} from '../../shared/contact/services/contact.service';
import {IdentityService} from '../../shared/contact/services/identity.service';
import {CacheService} from '../../shared/cache/cache.service';


@Component({
  selector: 'app-contact-list',
  templateUrl: './contact-list-page.component.html',
  styleUrls: ['./contact-list-page.component.scss']
})
export class ContactListPageComponent implements OnInit {

  assets = environment.assets;
  loadedItems$: Observable<ContactDecrypted[]>;
  loadedPendingInvitations$: Observable<InvitationDB[]>;
  searchCollapsed = true;

  constructor(private modalService: NgbModal,
              private authService: AuthService,
              private cacheService: CacheService,
              public route: ActivatedRoute,
              public router: Router,
              private contactService: ContactService,
              private identityService: IdentityService) {
  }

  ngOnInit() {
    this.cacheService.resetContactsLoaded();
    this.loadedPendingInvitations$ = this.contactService.getPendingInvitationsSubject();
    this.loadContacts();
  }

  loadMore(token: string) {
    // TODO implement or remove when BE is known
  }

  showMore() {
    // TODO implement or remove when BE is known
  }

  itemClicked(item: ContactDecrypted, tabId?: string) {
    this.router.navigate([`/contacts/detail`, item.contactInfo.userId], tabId ? {queryParams: {tab: tabId}} : undefined);
  }

  addContact() {
    const modalRef = this.modalService.open(AddContactChooseModalComponent);
    modalRef.result
      .then((value: boolean) => {
        let modalCreateEnter: NgbModalRef;
        // create new kontact key
        if (value === false) {
          modalCreateEnter = this.modalService.open(AddContactCreateKeyModalComponent);
        } else {
          modalCreateEnter = this.modalService.open(AddContactEnterKeyModalComponent);
        }
        return modalCreateEnter.result;
      }).then((result: ContactDecrypted) => {

        if (result instanceof ContactDecrypted) {
          const success = this.modalService.open(AddContactModalSuccessComponent);
          success.componentInstance.contact = result;
          success.result
            .then(() => {
              this.loadContacts();
            }).catch(() => {
              this.loadContacts();
          });
        } else if (result === 'invitation-created') {
          this.loadPendingInvitations();
        }
      }
    ).catch((dismiss) => {
      if (dismiss === 'add-contact-choose') {
        // start again from beginning
        this.addContact();
      }
      // do nothing
    });
  }

  private loadContacts() {
    this.identityService.getContactsSubject().next([]);
    this.loadedItems$ = this.identityService.getContactsSubject();
    this.identityService.loadContactsSubject();
  }

  private loadPendingInvitations() {
    this.loadedPendingInvitations$ = this.contactService.getPendingInvitations();
  }

}
