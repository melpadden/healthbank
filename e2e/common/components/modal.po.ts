import { by, element, protractor } from 'protractor';

export class ModalPO {
  content = element(by.className('modal-service'));

  modalFooter = this.content.element(by.css('.modal-footer'));
  modalBody = this.content.element(by.css('.modal-body'));
  modalHeader = this.modalBody.$$('h2').first();
  modalDescription = this.modalBody.$$('p').first();
  modalConfirmBtn = this.modalFooter.element(by.id('modal-confirm'));
  modalCancelBtn = this.modalFooter.element(by.id('modal-cancel'));

  /**
   * Retrieve the head and body text of a specific modal
   *
   * Returns a promise with an array with two elements:
   * ['modal header text', 'modal description']
   */
  getHeadBody() {
    return protractor.promise.all([this.modalHeader.getText(),
      this.modalDescription.getText()]);
  }
}
