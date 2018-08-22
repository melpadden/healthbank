import {Directive, HostListener} from '@angular/core';
import {NgControl} from '@angular/forms';

@Directive({
  selector: '[appPhoneFormat]'
})
export class PhoneFormatDirective {

  constructor(private formControl: NgControl) {
  }

  @HostListener('blur', ['$event.target.value'])
  onBlur(value: string) {
    if (this.formControl.valid &&
      this.formControl.value !== null && this.formControl.value !== undefined) {
      let leadingPlus = false;

      if (value.substring(0, 1) === '+') {
        leadingPlus = true;
      }

      let replaced: string = value.replace(/\D/g, '');

      if (replaced.substring(0, 3) === '000') {
        return value;
      }

      if (replaced.substring(0, 2) === '00') {
        replaced = '+' + replaced.substr(2);
      }

      if (leadingPlus) {
        replaced = '+' + replaced;
      }

      this.formControl.reset(replaced);
    }
  }
}
