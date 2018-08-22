import {AbstractControl, FormGroup, ValidatorFn} from '@angular/forms';
import {ValidationErrors} from '@angular/forms/src/directives/validators';

/**
 * Validator for passwords.
 *
 * Checks that a given character sequence of password to verify is same as password.
 * <p>
 * If the password still is not valid this check is skipped.
 */
export function passwordMatchValidator(originalPwd: AbstractControl): ValidatorFn {
  return (control: AbstractControl): { [key: string]: any } => {
    const valid = isSamePassword(originalPwd, control.value);
    return valid ? null : {'pwdSame': {value: false}};
  };
}

function isSamePassword(originalPwd: AbstractControl, pwdConfirm: string) {
  if (!originalPwd || !originalPwd.valid) {
    return true;
  }
  return originalPwd.value === pwdConfirm;
}

/**
 * Validator used on a form with 2 password fields. The name of those controls must be passed
 * and the validator checks if the content is the same. Will return 'pwdSame' validation error.
 *
 * @param {string} pwControl1Name control name of the first element from the form
 * @param {string} pwControl2Name control name of the second element from the form
 * @returns {ValidatorFn} a function which returns null if not same, or 'pwdSame' error
 */
export function passwordMatchFormValidator(pwControl1Name: string, pwControl2Name: string): ValidatorFn {
  return (controlElem: AbstractControl): ValidationErrors | null => {
    let formGroup;

    if (controlElem instanceof FormGroup) {
      formGroup = controlElem;
    } else {
      formGroup = controlElem.parent;
    }

    const password = formGroup.controls[pwControl1Name].value;
    const repeatPassword = formGroup.controls[pwControl2Name].value;

    if (repeatPassword.length <= 0) {
      return null;
    }

    if (repeatPassword !== password) {
      return {'pwdSame': {value: false}};
    }
    return null;
  };
}
