import {Component, Input, OnInit} from '@angular/core';
import {NgbActiveModal, NgbModalOptions} from '@ng-bootstrap/ng-bootstrap';
import {FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';
import {touchAllFields} from '../../shared/ngrx-form/ngrx-form-utils';
import {ContactService} from '../../shared/contact/services/contact.service';
import {ContactDecrypted} from '../../shared/contact/models/contact';
import {HttpErrorService} from '../../shared/app-http/http-error.service';

@Component({
  selector: 'app-add-contact-enter-key-modal',
  templateUrl: 'add-contact-enter-key-modal.component.html'
})
export class AddContactEnterKeyModalComponent implements OnInit {

  @Input() ownContactKey: string;
  addContactForm: FormGroup;
  disable: boolean;

  public static getModalOptions(): NgbModalOptions {
    return {
      size: 'lg'
    };
  }

  constructor(public activeModal: NgbActiveModal,
              private fb: FormBuilder,
              private errorService: HttpErrorService,
              private contactService: ContactService) {
    this.initFormDescription();
    this.enablePage();
  }

  ngOnInit() {
  }

  initFormDescription() {
    this.addContactForm = this.fb.group(
      {
        key: new FormControl('', [Validators.required]),
      });
  }

  onConfirm() {
    if (this.addContactForm.invalid) {
      touchAllFields(this.addContactForm);
      return;
    }
    this.disablePage();
    this.contactService.acceptInvitation(this.addContactForm.value['key'])
      .subscribe((contact: ContactDecrypted) => {
        this.enablePage();
        this.activeModal.close(contact);
      }, inviteError => {
        this.enablePage();

        console.log(inviteError);
        if (inviteError && inviteError.status) {
          this.errorService.processErrorToast(inviteError);
        }
        if (inviteError && inviteError.error && inviteError.error.error) {
          if (inviteError.error.error === 'contact__already_exists' || inviteError.error.error === 'contact__self_not_allowed') {
            return;
          }
          this.addContactForm.controls['key'].setErrors({[inviteError.error.error]: 'true'});
        } else {
          this.addContactForm.controls['key'].setErrors({default_error: 'true'});
        }
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
