import {Component, OnInit} from '@angular/core';
import {NgbActiveModal, NgbModalOptions} from '@ng-bootstrap/ng-bootstrap';
import {FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';
import {touchAllFields} from '../../shared/ngrx-form/ngrx-form-utils';
import {environment} from '../../../environments/environment';

@Component({
  selector: 'app-add-contact-choose-modal',
  templateUrl: 'add-contact-choose-modal.component.html'
})
export class AddContactChooseModalComponent implements OnInit {

  addContactChooseForm: FormGroup;
  assets = environment.assets;
  public static getModalOptions(): NgbModalOptions {
    return {
      size: 'lg'
    };
  }

  constructor(public activeModal: NgbActiveModal,
              private fb: FormBuilder
              ) {
    this.initFormDescription();
  }

  ngOnInit() {

  }

  initFormDescription() {
    this.addContactChooseForm = this.fb.group(
      {
        key: new FormControl('false', [Validators.required]),
      });
  }

  onConfirm() {
    if (this.addContactChooseForm.invalid) {
      touchAllFields(this.addContactChooseForm);
      return;
    }
    this.activeModal.close(this.addContactChooseForm.value['key'] === 'true');
  }

}
