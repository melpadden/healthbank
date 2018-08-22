import { browser, element, by } from 'protractor';
import { BASE_URL } from '../../helper';

export class LandingPagePO {
  container = element(by.css('app-landing-page'));

  title = this.container.element(by.css('h3'));
  user = this.container.element(by.id('input-username'));
  password = this.container.element(by.id('input-password'));
  submitButton = this.container.element(by.id('submit'));
  validationLabels = this.container.$$('.help-block.error');


  navigateTo() {
    // preferred way, but does not work: https://github.com/angular/protractor/issues/3911
    // browser.setLocation('/');
    browser.get(BASE_URL);
  }

  setUser = function (text: string) {
    this.user.clear();
    this.user.sendKeys(text);
  };

  setPassword = function (text: string) {
    this.password.clear();
    this.password.sendKeys(text);
  };
}
