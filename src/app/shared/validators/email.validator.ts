import {AbstractControl, ValidatorFn} from '@angular/forms';
import * as punycode from 'punycode';

/**
 * Validator für emails.
 *
 * Checks that a given character sequence (e.g. string) is a well-formed email address.
 * <p>
 * The specification of a valid email can be found in
 * EmailValidator of Hibernate, because this validator is written to
 * validate in exactly the same way as hibernate does.
 * Therefore no differences in BE and FE should occur.
 */
export function emailValidator(): ValidatorFn {
  return (control: AbstractControl): { [key: string]: any } => {
    const valid = isValidEmail(control.value);
    return valid ? null : {'email': {value: control.value}};
  };
}

const ATOM = '[a-z0-9!#$%&\'*+/=?^_`{|}~-]';
const DOMAIN = ATOM + '+(\\.' + ATOM + '+)*';
const IP_DOMAIN = '\\[[0-9]{1,3}\\.[0-9]{1,3}\\.[0-9]{1,3}\\.[0-9]{1,3}\\]';
const MAX_LOCAL_PART_LENGTH = 64;
const MAX_DOMAIN_PART_LENGTH = 255;

function isValidEmail(email: string) {
  const emailLocalRegex: RegExp = new RegExp('^' + ATOM + '+(\\.' + ATOM + '+)*$', 'i');
  const emailDomainRegex: RegExp = new RegExp('^' + DOMAIN + '$' + '|' + '^' + IP_DOMAIN + '$', 'i');

  if (!email) {
    return true;
  }

  const emailParts: string[] = email.split('@', 3);
  if (emailParts.length !== 2) {
    return false;
  }

  const [localPart, domainPart]: string[] = emailParts;

  // if we have a trailing dot in local or domain part we have an invalid email address.
  // the regular expression match would take care of this, but IDN.toASCII drops the trailing '.'
  // (imo a bug in the implementation)
  if (localPart[localPart.length - 1] === '.' || domainPart[domainPart.length - 1] === '.') {
    return false;
  }

  if (!matchPart(localPart, emailLocalRegex, MAX_LOCAL_PART_LENGTH)) {
    return false;
  }

  return matchPart(domainPart, emailDomainRegex, MAX_DOMAIN_PART_LENGTH);

}

function matchPart(part: string, pattern: RegExp, maxLength: number): boolean {
  let asciiString = '';

  try {
    asciiString = toAscii(part);

  } catch (e) {
    return false;
  }


  if (asciiString.length > maxLength) {
    return false;
  }

  return pattern.test(asciiString);
}

function toAscii(unicodeString: string): string {
  let asciiString = '';
  let start = 0;
  let end: number = unicodeString.length <= 63 ? unicodeString.length : 63;
  while (true) {
    // IDN.toASCII only supports a max "label" length of 63 characters. Need to chunk the input in these sizes

    asciiString += punycode.toASCII(unicodeString.substring(start, end));
    if (end === unicodeString.length) {
      break;
    }
    start = end;
    end = start + 63 > unicodeString.length ? unicodeString.length : start + 63;
  }

  return asciiString;
}
