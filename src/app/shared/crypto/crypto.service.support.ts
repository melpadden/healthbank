import {Injectable, NgZone} from '@angular/core';
import * as CONSTANTS from 'node-jose/lib/algorithms/constants.js';

/**
 * Contains crypto fallback implementations which target specific browsers and/or their bugs
 */
@Injectable()
export class CryptoServiceSupport {

  constructor(private _ngZone: NgZone) {
  }

  /**
   * Checks if the fallback implementation of PBKDF2 is required in this browser
   * @returns {boolean}
   */
  requiresSupportPbkdf2(): boolean {
    return window.navigator.userAgent.indexOf('Edge') > -1;
  }

  /**
   * A fallback implementation using Web Crypto API HMAC, instead of PBKDF2 directly. This is about 50x-100x slower than
   * using PBKDF2 directly in Chrome 67. This is necessary because Edge has a known issue with this KDF (currently 17):
   *
   * https://developer.microsoft.com/en-us/microsoft-edge/platform/issues/9259365/
   *
   * The implementation is based on: https://github.com/palant/pfp/blob/1137960674442554810e0884e873250b90183071/lib/crypto.js#L23
   * and a proof of concept can be found here: https://jsfiddle.net/for3st/r1bfkjyd/31/
   *
   * This runs outside the angular zone for performance reasons
   *
   * @param {Buffer} password
   * @param {Buffer} salt
   * @param {number} outLengthByte
   * @param {number} iterations
   * @param {string} hashType e.g. 'SHA-512'
   * @returns {PromiseLike<Buffer>} returns the derived key as buffer
   */
  derivePbkdf2Support(password: Buffer, salt: Buffer, outLengthByte: number, iterations: number, hashType: string): PromiseLike<Buffer> {
    return this._ngZone.runOutsideAngular(async any => {

      const DIGEST_LENGTH = CONSTANTS.HASHLENGTH[hashType] / 8;
      outLengthByte |= 0;

      function PRF(key, buffer) {
        return crypto.subtle.sign({
            name: 'HMAC',
            hash: hashType
          }, key, buffer
        );
      }

      function F(key, i: number) {
        const result = new Uint8Array(DIGEST_LENGTH);
        const saltWithIterator = new Uint8Array(salt.length + 4);
        for (let j = 0; j < salt.length; j++) {
          saltWithIterator[j] = salt[j];
        }

        saltWithIterator[saltWithIterator.length - 4] = (i >>> 24) & 0xFF;
        saltWithIterator[saltWithIterator.length - 3] = (i >>> 16) & 0xFF;
        saltWithIterator[saltWithIterator.length - 2] = (i >>> 8) & 0xFF;
        saltWithIterator[saltWithIterator.length - 1] = (i >>> 0) & 0xFF;

        function processResult(buffer) {
          buffer = new Uint8Array(buffer);
          for (let h = 0; h < DIGEST_LENGTH; h++) {
            result[h] ^= buffer[h];
          }

          iterations--;
          if (iterations > 0) {
            return PRF(key, buffer).then(processResult);
          } else {
            return result;
          }
        }

        return PRF(key, saltWithIterator).then(processResult);
      }

      // console.log((new Date()).getTime() + ' [start] iter:' + iterations + ' hashType:' + hashType +
      //   ' pw length:' + password.length + ' salt length:' + salt.length + ' outLength: ' + outLengthByte);
      return crypto.subtle.importKey(
        'raw',
        password, {
          name: 'HMAC',
          hash: hashType
        },
        false, ['sign']
      ).then(key => {
        const numChunks = Math.ceil(outLengthByte / DIGEST_LENGTH);
        const chunks = [];
        for (let i = 1; i <= numChunks; i++) {
          chunks.push(F(key, i));
        }
        return Promise.all(chunks);
      }).then(chunks => {
        const result = new Uint8Array(outLengthByte);
        for (let k = 0; k < outLengthByte; k++) {
          result[k] = chunks[k / DIGEST_LENGTH | 0][k % DIGEST_LENGTH];
        }
        // console.log((new Date()).getTime() + ' [end]' + new Date());
        return new Buffer(result);
      });
    });
  }
}
