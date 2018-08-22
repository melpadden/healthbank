import {Component, Input, OnDestroy, OnInit} from '@angular/core';
import {NgbActiveModal, NgbModalOptions} from '@ng-bootstrap/ng-bootstrap';
import {FormBuilder, FormGroup} from '@angular/forms';
import {ContactDecrypted} from '../../contact/models/contact';
import {IdentityService} from '../../contact/services/identity.service';
import {AuthService} from '../../auth/auth.service';
import 'rxjs/add/operator/shareReplay';
import {TagModel} from 'ngx-chips/core/accessor';
import {TimeLineItem} from '../models/timeline';
import {ShareItemService} from '../services/share-item.service';
import {Observable} from 'rxjs/Observable';
import {Subject} from 'rxjs/Subject';
import 'rxjs/add/operator/takeUntil';
import {TranslateService} from '@ngx-translate/core';
import {HttpErrorService} from '../../app-http/http-error.service';
import {environment} from '../../../../environments/environment';

@Component({
  selector: 'app-share-item-modal',
  templateUrl: 'share-item-modal.component.html',
  styleUrls: ['../../../../themes/tag-styles.scss', 'share-item-modal.component.scss']
})
export class ShareItemModalComponent implements OnInit, OnDestroy {

  addContactForm: FormGroup;
  filteredItems: Array<TagModel> = [];
  assets = environment.assets;
  @Input()
  timelineItem: TimeLineItem;

  sharedContacts: ContactDecrypted[] = [];
  contactsToRemove: ContactDecrypted[] = [];
  contactInputTranslations = {};

  disable: boolean;
  private ngUnsubscribe: Subject<any> = new Subject();

  public static getModalOptions(): NgbModalOptions {
    return {
      size: 'lg'
    };
  }

  constructor(public activeModal: NgbActiveModal,
              private fb: FormBuilder,
              private authService: AuthService,
              private translate: TranslateService,
              private identityService: IdentityService,
              private errorService: HttpErrorService,
              private shareItemService: ShareItemService) {
    this.initFormDescription();
    this.enablePage();
  }

  ngOnInit() {
    this.translate.get('share-contact-modal.contact.input.placeholder').subscribe((translation) => {
      this.contactInputTranslations['placeholder'] = translation;
    });
    this.translate.get('share-contact-modal.contact.input.secondary.placeholder').subscribe((translation) => {
      this.contactInputTranslations['secondaryPlaceholder'] = translation;
    });
  }

  init(contacts: Observable<ContactDecrypted[]>) {
    contacts
      .takeUntil(this.ngUnsubscribe)
      .subscribe((c: ContactDecrypted[]) => {
        this.filteredItems.length = 0;
        this.sharedContacts.length = 0;
        c.forEach(item => {
          if (this.timelineItem.users && this.timelineItem.users[item.contactInfo.userId]) {
            this.sharedContacts.push(item);
          } else {
            this.filteredItems.push({
              display: item.contactInfo.firstname + ' ' + item.contactInfo.lastname,
              value: item
            });
          }
        });
      });
  }

  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  initFormDescription() {
    this.addContactForm = this.fb.group(
      {
        contacts: <TagModel>[],
      });
  }

  onConfirm() {
    const addedContacts = this.addContactForm.controls['contacts'].value;
    let addResult: ContactDecrypted[] = [];
    if (this.contactsToRemove.length === 0 && (!addedContacts || addedContacts.length === 0)) {
      console.log('Nothing to Do');
      this.activeModal.close(this.sharedContacts);
      return;
    }
    if (addedContacts && addedContacts.length > 0) {
      addResult = addedContacts.filter(addedContact => {
        return this.contactsToRemove.find(contactToRemove => {
          if (contactToRemove.contactInfo.userId === addedContact.value.contactInfo.userId) {
            return true;
          }
          return false;
        }) === undefined;
      }).map(tagModel => {
        return tagModel.value;
      });
    }
    let removeResult: ContactDecrypted[] = this.contactsToRemove;
    if (addedContacts && addedContacts.length > 0) {
      removeResult = this.contactsToRemove.filter(contactToRemove => {
        return addedContacts.find(addedContact => {
          if (contactToRemove.contactInfo.userId === addedContact.value.contactInfo.userId) {
            return true;
          }
          return false;
        }) === undefined;
      });
    }
    removeResult.forEach(toRemove => {
      delete this.timelineItem.users[toRemove.contactInfo.userId];
    });

    this.disablePage();
    this.shareItemService.shareItem(this.timelineItem, addResult)
      .subscribe(() => {
          this.activeModal.close(this.sharedContacts.concat(addedContacts ? addedContacts.map(tagModel => tagModel.value) : []));
        this.enablePage();
        }, (error) => {
          this.errorService.processErrorToast(error);
        this.enablePage();
        }
      );
  }

  removeContact(contact: ContactDecrypted) {
    this.contactsToRemove.push(contact);
    this.sharedContacts = this.sharedContacts.filter(value => {
      return value.contactInfo.userId !== contact.contactInfo.userId;
    });

    this.filteredItems.push({
      display: contact.contactInfo.firstname + ' ' + contact.contactInfo.lastname,
      value: contact
    });
  }

  private enablePage() {
    this.addContactForm.enable();
    this.disable = false;
  }

  private disablePage() {
    this.addContactForm.disable();
    this.disable = true;
  }
}
