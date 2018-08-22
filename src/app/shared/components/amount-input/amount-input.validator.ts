import { FormControl } from '@angular/forms';
import { AmountPipe } from './amount.pipe';

export const parse = (input: string, minusSignAllowed: boolean, decimals: number): number => {
  if (input === '0') {
    input = '0.0';
  }

  if (!input) {
    return null;
  }

  if (minusSignAllowed) {
    if (input.trim() === '-') {
      return null;
    }
  }

  const withoutDots = input.replace(/\./g, '');
  const changedCommaToDots = withoutDots.replace(/,/g, '.');

  const isPureFloat = /^-?\d+(?:[.,]\d*?)?$/.test(changedCommaToDots);

  if (!isPureFloat) {
    return NaN;
  }

  const floatValue = parseFloat(changedCommaToDots);
  const baseExponentiation = Math.pow(10, decimals);
  return Math.trunc(floatValue * baseExponentiation) / baseExponentiation;
};

export const format = (input: number, decimals: number = 2): string => {
  const amountPipe = new AmountPipe();
  return amountPipe.transform(input, decimals);
};

const validateValue = (validationField: string,
                       minValue: number,
                       minusSignAllowed: boolean,
                       decimals: number,
                       formControl: FormControl) => {
  if (!formControl.value) {
    return null;
  }

  const parsed = parse(formControl.value, minusSignAllowed, decimals);
  const valid = !isNaN(parsed) && parsed >= minValue;

  return (valid) ? null : {
    [validationField]: {
      valid: false
    }
  };
};

export const validateNegativeAmount = (formControl: FormControl) => {
  return validateValue('negative_amount', Number.MIN_SAFE_INTEGER, true, 2, formControl);
};

export const validateAmount = (formControl: FormControl) => {
  return validateValue('amount', 0, false, 2, formControl);
};
