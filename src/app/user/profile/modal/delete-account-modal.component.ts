import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { User } from '../../../shared/user/user-data';

@Component({
  selector: 'app-delete-account-modal',
  templateUrl: './delete-account-modal.component.html',
  styles: [`
    .modal-body {
      text-align: center;
    }
  `]
})
export class DeleteAccountModalComponent implements OnInit {

  @Input()
  user: User;

  @Output()
  delete = new EventEmitter<void>();

  constructor(private activeModal: NgbActiveModal) { }

  ngOnInit() {
  }

  close() {
    this.activeModal.close();
  }

  deleteAccount() {
    this.delete.emit();
    this.close();
  }
}
