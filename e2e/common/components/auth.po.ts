/**
 * PO file to handle the repetitive login/logout methods
 */
import { browser } from 'protractor';
import { ToastPO } from './toast.po';
import { testAuthConfig } from '../../../src/test-common/test-data';
import { LandingPagePO } from '../public/landing-page.po';
import { NavigationPO } from './navigation.po';
import { waitForElementToDisappear, waitForElement } from 'protractor-helpers';

const navigation = new NavigationPO();
const toast = new ToastPO();
const landingPage = new LandingPagePO();

export class AuthPO {
  /**
   * Ensures the user is logged in. If not a login will be done.
   * As only a login is done, if the user is not logged in, this ensures an fast execution.
   *
   * Usage, e.g.: beforeEach(auth.beLoggedIn());
   */
  beLoggedIn() {
    return (done: DoneFn) => {
      this.hasJwtToken()
        .then(loggedIn => {
          if (!loggedIn) {
            console.log('User is not logged in, will ensure user is logged in!');
            return this.doLogin();
          }
        })
        .then(done);
    };
  }

  /**
   * Ensures the user is logged out. Will only logout if the user is logged in, thus supporting fast execution.
   *
   * Usage, e.g.: beforeEach(auth.beLoggedOut());
   */
  beLoggedOut() {
    return (done: DoneFn) => {
      this.hasJwtToken()
        .then(loggedIn => {
          if (loggedIn) {
            console.log('User is logged in, will logout user!');
            return this.getLoggedOut();
          }
        })
        .then(done);
    };
  }

  doLogin() {
    landingPage.navigateTo();

    landingPage.setUser(testAuthConfig.defaultUser.username);
    landingPage.setPassword(testAuthConfig.defaultUser.pwd);

    landingPage.submitButton.click();
    // possible solution for "as any" hack: https://github.com/DefinitelyTyped/DefinitelyTyped/pull/15465
    waitForElement(navigation.container as any);
  }

  getLoggedOut() {
    toast.closeAll();

    navigation.clickLogout();
    // possible solution for "as any" hack: https://github.com/DefinitelyTyped/DefinitelyTyped/pull/15465
    waitForElementToDisappear(navigation.logout as any);
  }

  hasJwtToken() {
    return this.getJwtToken()
      .then(info => info != null);
  }

  getJwtToken() {
    return browser.waitForAngular().then(() => {
      return browser.executeScript(function () {
        return window.sessionStorage.getItem('authinfo');
      });
    });
  }
}
