import {
  ChangeDetectorRef, Directive, EventEmitter, HostListener, Input, OnDestroy, OnInit,
  Output
} from '@angular/core';
import {TimeLineItem} from '../models/timeline';
import {BehaviorSubject} from 'rxjs/BehaviorSubject';
import {ContactDecrypted} from '../../contact/models/contact';
import {Observable} from 'rxjs/Observable';
import {Subject} from 'rxjs/Subject';
import {HttpErrorService} from '../../app-http/http-error.service';
import {IdentityService} from '../../contact/services/identity.service';
import {TranslateService} from '@ngx-translate/core';
import {NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {AuthService} from '../../auth/auth.service';
import {ShareItemModalComponent} from '../list/share-item-modal.component';
import * as _ from 'lodash';
import {ToastService} from '../../toast/toast.service';

@Directive({
  selector: '[appShareItem]'
})
export class ShareItemDirective implements OnInit, OnDestroy {

  @Input() item: TimeLineItem;
  @Output() itemChange = new EventEmitter<TimeLineItem>();

  addedBy: string;
  @Input() sharedContacts: BehaviorSubject<ContactDecrypted[]>;
  // @Output() sharedContactsChange: EventEmitter<BehaviorSubject<ContactDecrypted[]>> = new EventEmitter();
  private ngDestroy$: Subject<boolean> = new Subject<boolean>();
  private contacts$: BehaviorSubject<ContactDecrypted[]>;

  constructor(private translate: TranslateService,
              private modalService: NgbModal,
              private toastService: ToastService,
              private errorService: HttpErrorService,
              private identityService: IdentityService,
              public authService: AuthService) {
  }

  ngOnDestroy(): void {
    this.ngDestroy$.next(true);
    this.ngDestroy$.complete();
  }

  ngOnInit(): void {
    this.contacts$ = this.identityService.getContactsSubject();
    this.identityService.loadContactsSubject();
    this.initSharedItems();

  }

  @HostListener('click', ['$event'])
  onClick() {
    if (!this.contacts$ || !this.contacts$.getValue() || this.contacts$.getValue().length === 0) {
      this.toastService.error('share-contact-modal.error.no.contacts.message', 'share-contact-modal.error.no.contacts.title');
      return;
    }
    const modalRef = this.modalService.open(ShareItemModalComponent);
    modalRef.componentInstance.timelineItem = this.item;
    modalRef.componentInstance.init(this.contacts$);
    modalRef.result
      .then(value => {
        if (this.sharedContacts) {
          this.sharedContacts.next(value);
          // this.sharedContactsChange.emit(this.sharedContacts);
        }
      })
      .catch(reason => {

      });
  }

  private initSharedItems() {
    if (this.item.owner !== this.authService.getSessionUser().userId || !this.sharedContacts) {
      return;
    }
    this.sharedContacts.next([]);
    // this.sharedContactsChange.emit(this.sharedContacts);
    this.contacts$
      .takeUntil(this.ngDestroy$)
      .subscribe(contacts => {
        contacts.map(item => {
          if (this.item.users && this.item.users[item.contactInfo.userId]) {
            this.pushToSharedContacts(item);
            // this.sharedContactsChange.emit(this.sharedContacts);
          }
        });
      });
  }

  private pushToSharedContacts(contact: ContactDecrypted) {
    if (_.find(this.sharedContacts.getValue(), (item) => {
        return item.contactInfo.userId === contact.contactInfo.userId;
      }) === undefined) {
      this.sharedContacts.next(this.sharedContacts.value.concat(contact));
    }

  }
}
