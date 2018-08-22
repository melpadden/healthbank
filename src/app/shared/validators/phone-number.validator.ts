import {AbstractControl, ValidatorFn} from '@angular/forms';
import * as _ from 'lodash';

/**
 * Validator für phoneNumber.
 *
 * Checks that a given character sequence (e.g. string) is a well-formed phone number.
 */
export function phoneNumberValidator(): ValidatorFn {
  return (control: AbstractControl): { [key: string]: any } => {
    const valid = isValidPhoneNUmber(control.value);
    return valid ? null : {'phone': {value: control.value}};
  };
}

const PHONE_REGEXP: RegExp = new RegExp(`^(\\+|00|000)[1-9]{1}[0-9]{3,14}$`);

function isValidPhoneNUmber(phoneNumber: string) {
  if (phoneNumber != null) {
    // ignore space, dashes and dots as they will be removed by the input field
    phoneNumber = phoneNumber
      .replace(/\s/g, '')
      .replace(/-/g, '')
      .replace(/\./g, '');
  }
  return _.isUndefined(phoneNumber) || _.isNull(phoneNumber) || _.isEmpty(phoneNumber) || PHONE_REGEXP.test(phoneNumber);
}
