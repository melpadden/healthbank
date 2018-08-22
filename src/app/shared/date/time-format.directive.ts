import { Directive, ElementRef, HostListener } from '@angular/core';
import { NgControl, NgModel } from '@angular/forms';

@Directive({
  selector: '[appTimeFormat]'
})
export class TimeFormatDirective {

  constructor(private formControl: NgControl) {
  }

  @HostListener('blur', ['$event.target.value'])
  onBlur(value: string) {
    if (this.formControl.valid &&
      this.formControl.value !== null && this.formControl.value !== undefined &&
      this.formControl.value.length === 4) {
      this.formControl.reset(this.formControl.value.substr(0, 2) + ':' + this.formControl.value.substr(2, 2));
    }
  }
}
