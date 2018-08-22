import * as jose from 'node-jose';
import {CryptoServiceSupport} from './crypto.service.support';
import {async, TestBed} from '@angular/core/testing';

describe('CryptoServiceSupport', () => {
  let cryptoService: CryptoServiceSupport;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      providers: [CryptoServiceSupport]
    });
    cryptoService = TestBed.get(CryptoServiceSupport);
  }));

  it('should create an crypto service support instance', () => {
    expect(cryptoService).toBeDefined();
  });

  it('pbkdf2 support version check', async (done) => {
    const normalizedPw = Buffer.from('secret1234'.normalize('NFKD'), 'utf8');
    const salt = Buffer.from('salt1234', 'utf8');
    const iterations = 75;
    const outLength = 32;

    jose.JWA.derive('PBKDF2-SHA-512', normalizedPw, {
      salt: salt,
      iterations: iterations,
      length: outLength
    }).then((refKey) => {
      cryptoService.derivePbkdf2Support(normalizedPw, salt, outLength, iterations, 'SHA-512')
        .then(function (key: Buffer) {
          expect(key).toBeDefined();
          expect(key).toEqual(refKey);
          done();
        });
    });
  });

  it('pbkdf2 support check random values', async (done) => {
    checkIterate(
      jose.util.randomBytes(getRandomArbitrary(1, 32)),
      jose.util.randomBytes(getRandomArbitrary(4, 32)),
      100, 32, cryptoService, 50, done);
  });

  function getRandomArbitrary(min, max): number {
    return Math.random() * (max - min) + min;
  }

  function checkIterate(pw: Buffer, salt: Buffer, iterations: number, outLength: number, cryptoServiceParam: CryptoServiceSupport,
                        testRounds: number, done: Function): void {
    if (testRounds <= 0) {
      done();
    }

    jose.JWA.derive('PBKDF2-SHA-512', pw, {salt: salt, iterations: iterations, length: outLength}).then((refKey) => {
      cryptoServiceParam.derivePbkdf2Support(pw, salt, outLength, iterations, 'SHA-512')
        .then(function (key: Buffer) {
          expect(key).toBeDefined();
          expect(key).toEqual(refKey);
          checkIterate(
            jose.util.randomBytes(getRandomArbitrary(1, 32)),
            jose.util.randomBytes(getRandomArbitrary(4, 32)),
            --iterations, outLength, cryptoServiceParam, --testRounds, done);
        });
    });
  }
});
