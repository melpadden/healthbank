import { AbstractControl, FormArray, FormControl, FormGroup } from '@angular/forms';

export function touchAllFields(fg: FormGroup): void {
  const touchControl = (ac: AbstractControl) => {
    if (ac instanceof FormGroup) {
      this.touchAllFields(ac);
    } else if (ac instanceof FormArray) {
      for (const c of ac.controls) {
        touchControl(c);
      }
    } else if (ac instanceof FormControl) {
      ac.markAsTouched();
    } else {
      throw new Error('Unknown form control: ' + ac);
    }
  };

  for (const c of Object.keys(fg.controls)) {
    touchControl(fg.controls[c]);
  }
}
