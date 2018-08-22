import {Component, Input, OnDestroy, OnInit} from '@angular/core';
import {NgbActiveModal, NgbModalOptions} from '@ng-bootstrap/ng-bootstrap';
import {environment} from '../../../environments/environment';
import {ContactService} from '../../shared/contact/services/contact.service';
import {Subscription} from 'rxjs/Subscription';
import {HttpErrorResponse} from '@angular/common/http';
import {HttpErrorService} from '../../shared/app-http/http-error.service';

@Component({
  selector: 'app-add-contact-create-key-modal',
  templateUrl: 'add-contact-create-key-modal.component.html'
})
export class AddContactCreateKeyModalComponent implements OnInit, OnDestroy {

  @Input() ownContactKey = ' ';
  assets = environment.assets;
  private subscription: Subscription;

  public static getModalOptions(): NgbModalOptions {
    return {
      size: 'lg'
    };
  }

  constructor(public activeModal: NgbActiveModal,
              private errorService: HttpErrorService,
              private contactService: ContactService) {
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  ngOnInit() {
    this.subscription = this.contactService.createInvitation()
      .subscribe(value => {
        this.ownContactKey = value;
      }, error => {
        this.activeModal.dismiss();
        if (error instanceof HttpErrorResponse) {
          this.errorService.processErrorToast(error);
        } else {
          error.error = {error: 'general'};
          this.errorService.processErrorToast(error,
            {
              errorMsgTitle: 'add-contact-create-key-modal.error.toast.title.general',
              overrideErrorMsg: {['general']: 'add-contact-create-key-modal.error.toast.message.general'}
            });
        }
      });
  }

  close() {
    if (this.ownContactKey) {
      this.activeModal.close('invitation-created');
    }
  }

}
