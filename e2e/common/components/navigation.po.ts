import { $, by } from 'protractor';

export class NavigationPO {
  container = $('app-navigation');
  logout = this.container.element(by.id('logout'));

  clickLogout() {
    // ToDo: eventually open navigation when in responsive mode
    this.logout.click();
  }
}
