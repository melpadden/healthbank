import { LandingPagePO } from './landing-page.po';
import { testAuthConfig } from '../../../src/test-common/test-data';
import { NavigationPO } from '../components/navigation.po';
import { AuthPO } from '../components/auth.po';
import { ToastPO } from '../components/toast.po';
import { ElementFinder } from 'protractor';

// FIXME: enable/adapt the tests when the authorization service will be used
xdescribe('The landing page', () => {
  const page = new LandingPagePO();
  const auth = new AuthPO();
  const navbar = new NavigationPO();
  const toast = new ToastPO();

  beforeEach(auth.beLoggedOut());

  beforeEach(() => {
    page.navigateTo();
  });

  it('should have the login form visible, uninitialized', function () {
    expect(page.title.getText()).toEqual('Blueprint Login');
    expect(page.user.getText()).toBe('');
    expect(page.password.getText()).toBe('');

    // TODO write a matcher for this kind
    expect(page.validationLabels.reduce((acc: boolean, el: ElementFinder) => {
      return el.isDisplayed().then((res) => {
        return acc || res;
      });
    }, false)).toBeFalsy();
  });

  it('should be able to login even if casing of username is varying', function () {
    page.user.sendKeys(testAuthConfig.defaultUser.username.toUpperCase());
    page.password.sendKeys(testAuthConfig.defaultUser.pwd);
    page.submitButton.click();

    expect(auth.hasJwtToken()).toBe(true, 'should have an JWT token set');
    expect(navbar.container).toBeDisplayed();
  });

  it('should display an error message on failed login for incorrect username', function () {
    page.user.sendKeys(testAuthConfig.defaultUser.username + 'wrongUser');
    page.password.sendKeys(testAuthConfig.defaultUser.pwd);
    page.submitButton.click();

    expect(toast.errors.count()).toHaveCountOf(1);
    expect(toast.getHeadBody(toast.getLatestErrorToast()))
      .toEqual(['Anmeldefehler', 'Login fehlgeschlagen! Die Anmeldedaten sind ungültig.']);

    expect(auth.hasJwtToken()).toBe(false, 'should not have an JWT token set');
  });

  it('should display an error message on failed login as system user with incorrect password', function () {
    page.user.sendKeys(testAuthConfig.defaultUser.username);
    page.password.sendKeys(testAuthConfig.defaultUser.pwd + 'wrongPwd');
    page.submitButton.click();

    expect(toast.errors.count()).toHaveCountOf(1);
    expect(toast.getHeadBody(toast.getLatestErrorToast()))
      .toEqual(['Anmeldefehler', 'Login fehlgeschlagen! Die Anmeldedaten sind ungültig.']);

    expect(auth.hasJwtToken()).toBe(false, 'should not have an JWT token set');
  });

  it('should accept a whitespace only password and should check for incorrect password', function () {
    page.user.sendKeys(testAuthConfig.defaultUser.username);
    page.password.sendKeys(' ');
    page.submitButton.click();

    expect(toast.errors.count()).toEqual(1);
    expect(toast.getHeadBody(toast.getLatestErrorToast()))
      .toEqual(['Anmeldefehler', 'Login fehlgeschlagen! Die Anmeldedaten sind ungültig.']);

    expect(auth.hasJwtToken()).toBe(false);
  });

  // Disabled until validation is implemented on login form
  xit('should display an error message when either username or password are empty', function () {
    page.submitButton.click();

    expect(toast.errors.count()).toEqual(1);
    expect(toast.getHeadBody(toast.getLatestErrorToast()))
      .toEqual(['Validierungsfehler', 'Die Eingabefelder beinhalten Fehler. Bitte überprüfen Sie Ihre Eingaben!']);
    expect(page.validationLabels.count()).toBe(2);

    expect(auth.hasJwtToken()).toBe(false);
  });

  it('should after successful login show the home page', function () {
    auth.doLogin();

    expect(auth.hasJwtToken()).toBe(true);
    expect(navbar.container.isDisplayed()).toBeTruthy();
  });

  it('should after logout show the landing page', function() {
    auth.doLogin();

    expect(auth.hasJwtToken()).toBe(true);
    expect(navbar.container.isDisplayed()).toBeTruthy();

    auth.getLoggedOut();

    expect(page.container.isDisplayed()).toBeTruthy();
  });
});
