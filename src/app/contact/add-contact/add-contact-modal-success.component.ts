import {Component, Input, OnInit} from '@angular/core';
import {NgbActiveModal, NgbModalOptions} from '@ng-bootstrap/ng-bootstrap';
import {environment} from '../../../environments/environment';
import {ContactDecrypted} from '../../shared/contact/models/contact';

@Component({
  selector: 'app-add-contact-modal-success',
  templateUrl: 'add-contact-modal-success.component.html',
  styleUrls: ['add-contact-modal.component.scss']
})
export class AddContactModalSuccessComponent implements OnInit {
  assets = environment.assets;
  @Input() contact: ContactDecrypted;

  public static getModalOptions(): NgbModalOptions {
    return {
      size: 'lg'
    };
  }

  constructor(public activeModal: NgbActiveModal) {
  }

  ngOnInit() {

  }

}
