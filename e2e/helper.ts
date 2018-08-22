/**
 * Helper methods for Protractor tests
 */

import { browser } from 'protractor';
import { promise } from 'selenium-webdriver';
import moment = require('moment');
import { DateTime } from '../src/app/shared/date/date.type';

/**
 * Base path of the application. Use it as a base for your actual path. e.g. `${BASE_URL}/user/add` to get
 * something like "/ui/#/user/add" or in different configuration "/app/user/add
 */
export const BASE_URL = '/ui/#';

/**
 * Slows down test execution.
 *
 * This needs to be run before any tests are invoked (outside describe block)
 * @see http://stackoverflow.com/a/27483971
 */
export function slowDown() {
  const origFn = browser.driver.controlFlow().execute;

  browser.driver.controlFlow().execute = function() {
    const args = arguments;

    // queue 100ms wait
    origFn.call(browser.driver.controlFlow(), function() {
      return promise.delayed(100);
    });

    return origFn.apply(browser.driver.controlFlow(), args);
  };
}

/**
 * converts a Date type to a displayed string
 */
export function toDisplayedDate(date: Date | DateTime): string {
  return moment(date).format('DD.MM.YYYY');
}


