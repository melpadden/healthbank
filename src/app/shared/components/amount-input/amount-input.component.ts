import { Component, forwardRef, Input, OnDestroy } from '@angular/core';
import {
  AbstractControl, ControlValueAccessor, FormControl, NG_VALIDATORS, NG_VALUE_ACCESSOR, ValidationErrors,
  Validator, ValidatorFn, Validators
} from '@angular/forms';
import { Subscription } from 'rxjs/Subscription';
import { format, parse, validateAmount, validateNegativeAmount } from './amount-input.validator';

@Component({
  selector: 'app-amount-input',
  templateUrl: './amount-input.component.html',
  styleUrls: ['./amount-input.component.scss'],
  providers: [{
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => AmountInputComponent),
    multi: true,
  }, {
    provide: NG_VALIDATORS,
    useExisting: forwardRef(() => AmountInputComponent),
    multi: true,
  }]
})
export class AmountInputComponent implements ControlValueAccessor, OnDestroy, Validator {

  @Input()
  fieldId: string;

  @Input()
  placeholder: string;

  @Input()
  decimals = 2;

  @Input()
  show = true;

  @Input()
  textAlignClass = 'text-right';

  @Input()
  set additionalValidators(newValidator: ValidatorFn | ValidatorFn[] | null) {
    let amountValidator = validateAmount;
    if (this.negativeNumbersAreAllowed) {
      amountValidator = validateNegativeAmount;
    }
    if (newValidator) {
      this.internalControl.setValidators([amountValidator, this.coerceToValidator(newValidator)]);
    } else {
      this.internalControl.setValidators(amountValidator);
    }
    this.internalControl.updateValueAndValidity();
  }

  negativeNumbersAreAllowed = false;

  @Input()
  set negativeNumbersAllowed(negativeNumbersAllowed: boolean) {
    if (negativeNumbersAllowed) {
      this.negativeNumbersAreAllowed = true;
      this.internalControl.setValidators(validateNegativeAmount);
    }
  }

  internalControl: FormControl;
  private internalControlSubscription: Subscription;

  constructor() {
    this.internalControl = new FormControl('', validateAmount);

    this.internalControlSubscription = this.internalControl.valueChanges.subscribe(internalData => {
      const externalData = parse(internalData, this.negativeNumbersAreAllowed, this.decimals);
      this.propagateChange(externalData);
    });
  }

  validate(c: AbstractControl): ValidationErrors | any {
    return this.internalControl.validator(this.internalControl);
  }

  @Input()
  set value(value: number) {
    this.writeValue(value);
  }

  @Input()
  set disabled(disabled: boolean) {
    if (disabled) {
      this.internalControl.disable();
    } else {
      this.internalControl.enable();
    }
  }

  public registerOnTouched() {
  }

  public writeValue(externalData: number) {
    // note: 0 is treated as boolean false and therefore !externalData triggers if value = 0
    if (externalData !== 0 && !externalData) {
      this.internalControl.setValue(externalData);
      return;
    }

    const formatted = format(externalData, this.decimals);
    this.internalControl.setValue(formatted);
  }

  public registerOnChange(fn: any) {
    this.propagateChange = fn;
  }

  reformat() {
    const parsed = parse(this.internalControl.value, this.negativeNumbersAreAllowed, this.decimals);
    if (isNaN(parsed)) {
      return;
    }

    const formatted = format(parsed, this.decimals);
    this.internalControl.setValue(formatted);
  }

  ngOnDestroy() {
    this.internalControlSubscription.unsubscribe();
  }

  private propagateChange(_: any) {
    // overridden by parent form, used to propagate changes
  }

  private coerceToValidator(validator: ValidatorFn | ValidatorFn[] | null) {
    return Array.isArray(validator) ? Validators.compose(validator) : validator || null;
  }
}
