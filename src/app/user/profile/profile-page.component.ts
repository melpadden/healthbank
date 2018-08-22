import { Component, OnInit } from '@angular/core';
import { NgbModal, NgbModalOptions } from '@ng-bootstrap/ng-bootstrap';
import { DeleteAccountModalComponent } from './modal/delete-account-modal.component';
import { ConfirmDeleteAccountModalComponent } from './modal/confirm-delete-account-modal.component';
import { AuthService } from '../../shared/auth/auth.service';
import { User } from '../../shared/user/user-data';
import { COUNTRIES } from '../../shared/countries';

@Component({
  selector: 'app-profile',
  templateUrl: './profile-page.component.html',
  styleUrls: ['./profile-page.component.scss']
})
export class ProfilePageComponent implements OnInit {

  user: User;
  deletionCode: string;
  ngbModalOptions: NgbModalOptions = {
    backdrop: 'static',
    keyboard: false,
  };

  constructor(private ngbModal: NgbModal,
              private authService: AuthService) {
  }

  ngOnInit() {
    this.user = this.authService.getSessionUser().user;
  }

  startDeleteAccount() {
    const deleteAccountModalRef = this.ngbModal.open(DeleteAccountModalComponent, this.ngbModalOptions).componentInstance;
    deleteAccountModalRef.user = this.user;
    deleteAccountModalRef.delete.subscribe(() => {
      this.deleteAccount();
    });
  }

  getNationality(code: string): string {
    return COUNTRIES[code];
  }

  private deleteAccount() {
    const confirmDeleteAccountModalRef = this.ngbModal.open(ConfirmDeleteAccountModalComponent, this.ngbModalOptions).componentInstance;
    confirmDeleteAccountModalRef.confirmDelete.subscribe(($event) => {
      this.confirmDeleteAccount($event);
    });
  }

  private confirmDeleteAccount(deletionCode: string) {
    this.deletionCode = deletionCode;
  }
}
