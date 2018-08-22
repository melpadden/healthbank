import { Component, OnInit, Input } from '@angular/core';
import { NgbActiveModal, NgbModalOptions } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-confirm-dialog',
  templateUrl: 'confirm.component.html'
})
export class ConfirmDialogComponent implements OnInit {

  @Input() title: string;

  @Input() message: string;

  @Input() note?: string;

  @Input() cancelLabel?: string;

  @Input() confirmLabel?: string;

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
