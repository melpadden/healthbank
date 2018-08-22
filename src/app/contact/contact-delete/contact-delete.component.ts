import {Component, Input, OnInit} from '@angular/core';
import {NgbActiveModal, NgbModalOptions} from '@ng-bootstrap/ng-bootstrap';
import {environment} from '../../../environments/environment';
import {ContactDecrypted} from '../../shared/contact/models/contact';

@Component({
  selector: 'app-contact-delete-dialog',
  templateUrl: 'contact-delete.component.html'
})
export class ContactDeleteDialogComponent implements OnInit {

  @Input() contact: ContactDecrypted;
  assets = environment.assets;

  public static getModalOptions(): NgbModalOptions {
    return {
      size: 'lg'
    };
  }

  constructor(public activeModal: NgbActiveModal) {
  }

  ngOnInit() {

  }

  onConfirm() {
    this.activeModal.close();
  }

}
