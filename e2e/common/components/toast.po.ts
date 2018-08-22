import { by, element, ElementFinder, protractor } from 'protractor';


export class ToastPO {
  container = element(by.id('toast-container'));
  any = element.all(by.className('toast'));
  success = element.all(by.className('toast-success'));
  info = element.all(by.className('toast-info'));
  warning = element.all(by.className('toast-warning'));
  errors = element.all(by.className('toast-error'));

  /**
   * Retrieve the head and body text of a specific toast
   * @param toast WebElement of the specific toast in interest. Retrieved e.g. by this.errors.first()
   * @returns {*}
   */
  getHeadBody(toast: ElementFinder) {
    return protractor.promise.all([toast.element(by.className('toast-title')).getText(),
      toast.element(by.className('toast-message')).getText()]);
  }

  getLatestToast() {
    return element(by.className('toast'));
  }

  getLatestSuccessToast() {
    return element(by.className('toast-success'));
  }

  getLatestInfoToast() {
    return element(by.className('toast-info'));
  }

  getLatestWarningToast() {
    return element(by.className('toast-warning'));
  }

  getLatestErrorToast() {
    return element(by.className('toast-error'));
  }

  closeAll() {
    this.any.$$('button').click();
  }
}
