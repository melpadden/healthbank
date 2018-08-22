import { AbstractControl, ValidatorFn } from '@angular/forms';
import { isValidTime } from './date.type';

/**
 * Validator für Uhrzeiten. Korrekte Uhrzeiten können einen Trenn-Doppelpunkt beinhalten oder nicht.
 * Es muss aber Stunde und Minuten angegeben werden.
 */
export function timeValidator(): ValidatorFn {
  return (control: AbstractControl): {[key: string]: any} => {
    const valid = isValidTime(control.value);
    return valid ? null : {'time': true};
  };
}
