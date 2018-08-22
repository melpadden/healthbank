import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-confirm-delete-account-modal',
  templateUrl: './confirm-delete-account-modal.component.html',
  styles: [`
    .modal-body {
      text-align: center;
    }
  `]
})
export class ConfirmDeleteAccountModalComponent implements OnInit {

  @Output()
  confirmDelete = new EventEmitter<string>();

  deletionCode: string;

  constructor(private activeModal: NgbActiveModal) { }

  ngOnInit() {
  }

  close() {
    this.activeModal.close();
  }

  confirmDeleteAccount() {
    this.confirmDelete.emit(this.deletionCode);
    this.close();
  }
}
