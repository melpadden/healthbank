import { normalizeEmptyStrings } from './app-http/request-body-normalizer';

/**
 * Collection of utilities used for network operations
 */

export function toJsonBlob(obj: {}): Blob {
  const jsonStr: string = JSON.stringify(normalizeEmptyStrings(obj));

  return new Blob([unicodeStringToTypedArray(jsonStr)], {type: 'application/json;charset=UTF-8'});
}


/**
 * Convert a string to a UTF-8 encoded byte array
 */
export function unicodeStringToTypedArray(s: string) {
  const binstr: string = encodeURIComponent(s).replace(/%([0-9A-F]{2})/g, (_: string, p1: string) => {
    return String.fromCharCode(Number('0x' + p1));
  });

  const ua: Uint8Array = new Uint8Array(binstr.length);
  Array.prototype.forEach.call(binstr, (ch: string, idx: number) => {
    ua[idx] = ch.charCodeAt(0);
  });

  return ua;
}


/**
 * Wraps the functionality of encodeURIComponent.
 * Adds a check whether the parameter is defined and not null.
 * In case of undefined or null throws an error is thrown
 */
export function encodeURIComponentWrapper(s: string|number): string {
  if (!s) {
    throw new Error('The URI parameter must be defined!');
  }
  return encodeURIComponent(String(s));
}
