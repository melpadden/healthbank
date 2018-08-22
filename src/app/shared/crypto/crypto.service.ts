/*-
 * #%L
 * RISE CryptoService
 * %%
 * Copyright (C) 2018 Research Industrial Systems Engineering GmbH
 * %%
 * Deutsch
 *  1 (C) by Research Industrial Systems Engineering (RISE) Forschungs-, Entwicklungs-
 *    und Großprojektberatung GmbH 2018 nach österreichischem Recht
 *  2 Urheber dieser Software mit der Bezeichnung RISE CryptoService (Computerprogramm iSv § 40a österreichisches UrhG) ist die
 *    Research Industrial Systems Engineering (RISE) Forschungs-, Entwicklungs- und Großprojektberatung GmbH mit Sitz in A-2320 Schwechat.
 *  3 Die Verwertungsrechte stehen grundsätzlich ausschließlich dem Urheber zu.
 *  4 Eine Werknutzungsbewilligung sowohl für private oder andere nicht kommerzielle Zwecke als auch für einen
 *    professionellen, kommerziellen oder produktiven Einsatz bedarf einer gesonderten schriftlichen Vereinbarung.
 *  5 Ein wie auch immer geartetes Bearbeitungsrecht besteht grundsätzlich nicht und bedürfte der vorangehenden
 *    schriftlichen Zustimmung durch den Urheber.
 *  6 Eine Veröffentlichung dieser Software ist nicht erlaubt und bleibt dem Urheber vorbehalten.
 *  7 Der Urheber behält sich vor, für die Einräumung von Rechten an dieser Software ein Lizenzentgelt einzuheben.
 * English
 *  1 (C) by Research Industrial Systems Engineering (RISE) Forschungs-, Entwicklungs-
 *    und Großprojektberatung GmbH 2018 under the laws of Austria
 *  2 The originator of this software named RISE CryptoService (computer program according to § 40a Austrian Copyright Act) is Research
 *    Industrial Systems Engineering (RISE) Forschungs-, Entwicklungs- und Großprojektberatung GmbH with it’s seat in A-2320 Schwechat.
 *  3 The exclusive exploitation rights remain with the originator.
 *  4 A right to use the software (licence) for private or other non-commercial purposes as well as for
 *    professional, commercial or productive use requires a separate agreement in writing.
 *  5 A right to edit or process the software of whatever kind is basically not granted and requires the prior
 *    written consent of the originator.
 *  6 Publication of this software is not permitted and remains reserved to the originator.
 *  7 The originator reserves the right to levy a license fee for the granting of rights to the software.
 * #L%
 */

import * as _ from 'lodash';
import * as jose from 'node-jose';
import * as msgpack from 'msgpack-lite';
import * as CONSTANTS from 'node-jose/lib/algorithms/constants.js';
import * as bs58 from 'bs58';
import {Injectable} from '@angular/core';
import {CryptoServiceSupport} from './crypto.service.support';

/**
 * Implementation of cryptography primitives and helper methods.
 */
@Injectable()
export class CryptoService {

  private readonly primitives = {
    // asymmetric primitives
    curve: 'P-384',
    signature: 'ES384',
    keyexchange: 'ECDH-ES',
    // symmetric primitives
    cipher: 'A256GCM',
    // create keys from passwords
    passwordKDF: 'PBKDF2',
    passwordKDFHash: 'SHA-512',
    passwordRounds: 30000,
    // for contact tokens only
    cipherToken: 'A128GCM',
    digestToken: 'SHA-256',
    // JWT
    jwtFormat: 'compact'
  };

  private readonly allowedPrimitives = {
    curve: [ 'P-384', 'P-521' ],
    signature: [ 'ES384', 'ES512' ],
    keyexchange: [ 'ECDH-ES' ],
    cipher: [ 'A256GCM' ],
    cipherToken: [ 'A128GCM' ]
  };

  private keypairs = {
    authentication: null,
    signature: null,
    content: null
  };

  constructor(private cryptoServiceSupport: CryptoServiceSupport) {
  }

  public async generateKeypairs(): Promise<any> {

    const keystore = jose.JWK.createKeyStore();

    const keypairs = await Promise.all([
      keystore.generate('EC', this.primitives.curve, {
        use: 'sig',
        alg: this.primitives.signature,
        usage: 'authentication'
      }),
      keystore.generate('EC', this.primitives.curve, {
        use: 'sig',
        alg: this.primitives.signature,
        usage: 'signature'
      }),
      keystore.generate('EC', this.primitives.curve, {
        use: 'enc',
        alg: this.primitives.keyexchange,
        usage: 'content'
      }),
    ]);

    this.keypairs.authentication = keypairs[0];
    this.keypairs.signature = keypairs[1];
    this.keypairs.content = keypairs[2];

    this.assertSupportedPrimitives(this.keypairs.authentication);
    this.assertSupportedPrimitives(this.keypairs.signature);
    this.assertSupportedPrimitives(this.keypairs.content);

    return this.exportPublicKeys();
  }

  public async createRegistrationConfirmation(userId: string, registrationCode?: string): Promise<string> {
    this.assertInitializedKeystore();

    const confirmation: string = await jose.JWS.createSign({
      alg: this.keypairs.authentication.alg,
      format: this.primitives.jwtFormat,
    }, this.keypairs.authentication)
    .update(JSON.stringify({
      sub: userId,
      code: registrationCode
    }))
    .final();

    return confirmation;
  }

  public async updateKeyId(jwk: any): Promise<any> {
    this.assertInitializedKeystore();

    const keypair: any = await jose.JWK.asKey(jwk);
    const usage: string = keypair.get('usage', false);

    if (this.keypairs[usage] && this.isEqualPublicKey(this.keypairs[usage], keypair)) {

      this.keypairs[usage] = await jose.JWK.asKey(
        _.merge(this.keypairs[usage].toJSON(true), { kid: keypair.kid })
      );

    } else {
      throw new Error('No matching keypair found.');
    }

    this.assertSupportedPrimitives(this.keypairs[usage]);

    return this.keypairs[usage].toJSON(false);
  }

  public async exportKeystore(password: string): Promise<string> {
    this.assertInitializedKeystore();

    const salt: Buffer = jose.util.randomBytes(32);
    const key: any = await this.keyFromPassword(password, salt);
    this.assertSupportedPrimitives(key);

    const keystore: any = await this.keysToKeystore();

    // encrypt client_keystore and store somewhere
    const encryptedKeystore: string = await jose.JWE.createEncrypt({
      iv: jose.util.randomBytes(CONSTANTS.NONCELENGTH[key.alg] / 8),
      format: this.primitives.jwtFormat,
      fields: {
        cty: 'jwk-set+json',
        alg: 'dir',
        enc: key.alg,
        passwordsalt: salt.toString('hex')
      }
    }, key)
    .update(JSON.stringify(keystore.toJSON(true)))
    .final();

    return encryptedKeystore;
  }

  public async importKeystore(keystore: string, password: string): Promise<any> {

    const parts: string[] = keystore.split('.');

    if (parts.length !== 5) {
      throw new Error('Invalid JWE.');
    }

    const header: any = JSON.parse(jose.util.base64url.decode(parts[0]).toString('utf8'));

    if (typeof header === 'undefined' || header === null ||
      typeof header.passwordsalt === 'undefined' || header.passwordsalt === null) {
      throw new Error('Invalid JWE header or passwordsalt missing.');
    }

    const key: any = await this.keyFromPassword(password, Buffer.from(header.passwordsalt, 'hex'));
    this.assertSupportedPrimitives(key);

    const keystoreBuffer: any = await jose.JWE.createDecrypt(key, {
      fields: {
        alg: 'dir',
        enc: key.alg
      }
    })
    .decrypt(keystore);

    const keystoreJWK: any = await jose.JWK.asKeyStore(keystoreBuffer.plaintext.toString('utf8'));

    this.keypairs.authentication = this.getKeyByUsage(keystoreJWK, 'authentication');
    this.keypairs.signature = this.getKeyByUsage(keystoreJWK, 'signature');
    this.keypairs.content = this.getKeyByUsage(keystoreJWK, 'content');

    this.assertSupportedPrimitives(this.keypairs.authentication);
    this.assertSupportedPrimitives(this.keypairs.signature);
    this.assertSupportedPrimitives(this.keypairs.content);

    return this.exportPublicKeys();
  }

  public exportPublicKeys(): any {
    this.assertInitializedKeystore();

    return {
      authenticationKey: this.keypairs.authentication.toJSON(false),
      signatureKey: this.keypairs.signature.toJSON(false),
      contentKey: this.keypairs.content.toJSON(false)
    };
  }

  public clearKeystore(): void {
    this.keypairs.authentication = null;
    this.keypairs.signature = null;
    this.keypairs.content = null;
  }

  public getAuthenticationKeyId(): string {
    this.assertInitializedKeystore();

    return this.keypairs.authentication.kid;
  }

  public async createAuthenticationToken(token: any): Promise<any> {
    this.assertInitializedKeystore();

    if (typeof token === 'undefined' || token === null ||
      typeof token.challenge === 'undefined' || token.challenge === null) {

      throw new Error('Invalid authentication challenge.');
    }

    const proof: any = await jose.JWS.createSign({
      alg: this.keypairs.authentication.alg,
      format: this.primitives.jwtFormat,
    }, this.keypairs.authentication)
    .update(JSON.stringify(token.challenge))
    .final();

    token.proof = proof;

    return token;
  }

  public async encrypt(plaintexts: Map<string, Blob | string>): Promise<[ string, Map<string, Blob | string> ]> {
    this.assertInitializedKeystore();

    // create symmetric content-key in JWK format to encrypt data
    // TODO replace with the following code when published on npmjs
    // jose.JWK.createKey('oct', 256, { alg: this.primitives.cipher }
    const keyJWK: any = await jose.JWK.createKeyStore().generate(
      'oct',
      CONSTANTS.KEYLENGTH[this.primitives.cipher],
      {
        alg: this.primitives.cipher
      }
    );

    this.assertSupportedPrimitives(keyJWK);

    // sign-then-encrypt content-key
    const keyJWS: string = await this.signKey(keyJWK);
    const keyJWE: string = await this.encryptKey(keyJWS, this.keypairs.content);

    const result: Map<string, Blob | string> = await this.signThenEncryptGeneric(plaintexts, keyJWK);

    return [ keyJWE, result ];
  }

  public async decrypt(ciphertexts: Map<string, Blob | string>, keyJWE: string)
  : Promise<Map<string, Blob | string>> {

    const keyJWK: any = await this.decryptKey(keyJWE, this.keypairs.signature);
    this.assertSupportedPrimitives(keyJWK);

    return await this.decryptAndVerifyGeneric(ciphertexts, keyJWK, this.keypairs.signature);
  }

  public async decryptShared(ciphertexts: Map<string, Blob | string>, keyJWE: string, signaturePublicKey: any)
  : Promise<Map<string, Blob | string>> {

    const keyJWK: any = await this.decryptKey(keyJWE, signaturePublicKey);
    this.assertSupportedPrimitives(keyJWK);

    return await this.decryptAndVerifyGeneric(ciphertexts, keyJWK, signaturePublicKey);
  }

  public async share(keyJWE: string, receiverContentPublicKeys: Map<string, any>): Promise<Map<string, string>> {

    const keyJWK: any = await this.decryptKey(keyJWE, this.keypairs.signature);
    this.assertSupportedPrimitives(keyJWK);

    const keyJWS: string = await this.signKey(keyJWK);

    const result = new Map<string, string>();

    for (const entry of Array.from(receiverContentPublicKeys.entries())) {
      const mapKey: string = entry[0];
      const publicKey: any = entry[1];

      const tmp =  await this.encryptKey(keyJWS, publicKey);
      result.set(mapKey, tmp);
    }

    return result;
  }

  public async encryptTokenKey(plaintexts: Map<string, Blob | string>, token?: string)
  : Promise<[ Map<string, Blob | string>, string, string ]> {
    this.assertInitializedKeystore();

    let key: Buffer = null;
    let keyJWK: any = null;

    if (token === undefined) {

      /*
        create random 128bit encryption key and convert these 16 bytes to base58
        16 x 0x00:       1111111111111111 (16 chars)
        16 x 0xFF: YcVfxkQb6JRzqk5kF2tNLv (22 chars)
      */
      keyJWK = await jose.JWK.createKeyStore().generate(
        'oct',
        CONSTANTS.KEYLENGTH[this.primitives.cipherToken],
        {
          alg: this.primitives.cipherToken,
          usage: 'token'
        }
      );

      // get key (k) as Buffer
      key = keyJWK.toObject(true).k;
      const base58: string = bs58.encode(key);

      token = [
        base58.slice(0, 4),
        base58.slice(4, 10),
        base58.slice(10, 16),
        base58.slice(16)
      ]
      .filter(word => word.length > 0)
      .join('-');

    } else {

      const plaintoken: string = token.split('-').join('');
      key = bs58.decode(plaintoken);

      // key (Buffer) to JWK
      keyJWK = await jose.JWK.asKey({
        kty: 'oct',
        k: key,
        alg: this.primitives.cipherToken,
        usage: 'token'
      });

    }

    this.assertSupportedPrimitives(keyJWK);

    const newId: Buffer = await jose.JWA.digest(this.primitives.digestToken, key);
    const id: string = newId.toString('hex');

    const payload: Map<string, Blob | string> = await this.encryptGeneric(plaintexts, keyJWK);

    return [ payload, token, id ];
  }

  public async decryptTokenKey(ciphertexts: Map<string, Blob | string>, token: string)
  : Promise<Map<string, Blob | string>> {

    const plaintoken: string = token.split('-').join('');

    const key: Buffer = bs58.decode(plaintoken);

    // key (Buffer) to JWK
    const keyJWK: any = await jose.JWK.asKey({
      kty: 'oct',
      k: key,
      alg: this.primitives.cipherToken,
      usage: 'token'
    });

    this.assertSupportedPrimitives(keyJWK);

    const plaintext: Map<string, string | Buffer> = await this.decryptGeneric(ciphertexts, keyJWK);

    // convert all Buffer's to Blob's
    const result = new Map<string, string | Blob>();
    plaintext.forEach( ( value, mapKey, map ) => {
      if (value instanceof Buffer) {
        result.set(mapKey, this.toBlob(value));
      } else {
        result.set(mapKey, value);
      }
    });

    return result;
  }

  public async readAsBuffer(blob: Blob): Promise<Buffer> {
    return new Promise<Buffer>((resolve, reject) => {
        const reader = new FileReader();
        reader.addEventListener('load', event => resolve(jose.util.asBuffer((<FileReader>event.target).result)));
        reader.addEventListener('error', event => reject((<FileReader>event.target).error));
        reader.readAsArrayBuffer(blob);
    });
  }

  private async signThenEncryptGeneric(plaintexts: Map<string, string | Blob>, keyJWK: any)
  : Promise<Map<string, Blob | string>> {

    this.assertInitializedKeystore();

    const result = new Map<string, Buffer | string>();

    for (const entry of Array.from(plaintexts.entries())) {

      const key: string = entry[0];
      const plaintext: string | Blob = entry[1];

      const plaintextBuffer: Buffer = await this.toBuffer(plaintext);

      let plaintextAndSignature: Buffer | string = null;
      if (plaintext instanceof Blob) {

        const signatureResult: any = await this.keypairs.signature.sign(
          this.keypairs.signature.alg, plaintextBuffer, {}
        );

        plaintextAndSignature = msgpack.encode({
          data: plaintextBuffer,
          sig: signatureResult.mac
        });

      } else {

        plaintextAndSignature = await jose.JWS.createSign({
          alg: this.keypairs.signature.alg,
          format: this.primitives.jwtFormat,
        }, this.keypairs.signature)
        .update(plaintextBuffer)
        .final();

      }

      result.set(key, plaintextAndSignature);
    }

    return this.encryptGeneric(result, keyJWK);
  }

  private async encryptGeneric(plaintexts: Map<string, Blob | Buffer | string>, keyJWK: any)
  : Promise<Map<string, Blob | string>> {

    const result = new Map<string, Blob | string>();

    for (const entry of Array.from(plaintexts.entries())) {

      const key: string = entry[0];
      const plaintext: Blob | Buffer | string = entry[1];

      const plaintextBuffer: Buffer = await this.toBuffer(plaintext);

      let ciphertext: Blob | string = null;
      const iv = jose.util.randomBytes(CONSTANTS.NONCELENGTH[keyJWK.alg] / 8);
      if (plaintext instanceof Blob || plaintext instanceof Buffer) {

        const encryptResult: { data: Buffer; tag: Buffer; iv: Buffer; ver: number} = await keyJWK.encrypt(
          keyJWK.alg, plaintextBuffer, {
            iv: iv
          }
        );
        encryptResult.iv = iv;
        encryptResult.ver = 1;

        const ciphertextBuffer: Buffer = msgpack.encode(encryptResult);
        ciphertext = this.toBlob(ciphertextBuffer);

      } else {

        ciphertext = await jose.JWE.createEncrypt({
          iv: iv,
          format: this.primitives.jwtFormat,
          fields: {
            alg: 'dir',
            enc: keyJWK.alg,
          }
        }, keyJWK)
        .update(plaintextBuffer)
        .final();

      }

      result.set(key, ciphertext);
    }

    return result;
  }

  private async decryptAndVerifyGeneric(ciphertexts: Map<string, Blob | string>, keyJWK: any, signaturePublicKey: any)
  : Promise<Map<string, Blob | string>> {

    const plaintexts = await this.decryptGeneric(ciphertexts, keyJWK);

    const signaturePublicKeyJWK: any = await jose.JWK.asKey(signaturePublicKey);
    this.assertSupportedPrimitives(signaturePublicKeyJWK);

    const result = new Map<string, Blob | string>();
    for (const entry of Array.from(plaintexts.entries())) {

      const key: string = entry[0];
      const plaintextAndSignature: Buffer | string = entry[1];

      let payload: Blob | string = null;
      if (plaintextAndSignature instanceof Buffer) {

        const decoded: { data: Buffer; sig: Buffer } = msgpack.decode(plaintextAndSignature);

        await signaturePublicKeyJWK.verify(signaturePublicKeyJWK.alg, decoded.data, decoded.sig);

        payload = this.toBlob(decoded.data);

      } else {

        const validationResult: any = await jose.JWS.createVerify(
          signaturePublicKeyJWK, {
            allowEmbeddedKey: false
          }
        )
        .verify(plaintextAndSignature);

        payload = validationResult.payload.toString('utf8');

      }

      result.set(key, payload);
    }

    return result;
  }

  private async decryptGeneric(ciphertexts: Map<string, Blob | string>, keyJWK: any)
  : Promise<Map<string, Buffer | string>> {

    const result = new Map<string, Buffer | string>();

    for (const entry of Array.from(ciphertexts.entries())) {

      const key: string = entry[0];
      const ciphertextTmp: Blob | string = entry[1];

      let plaintext: Buffer | string = null;
      if (ciphertextTmp instanceof Blob) {

        const ciphertextBuffer: Buffer = await this.readAsBuffer(ciphertextTmp);
        const ciphertext: { data: Buffer; tag: Buffer; iv: Buffer; ver: number } = msgpack.decode(ciphertextBuffer);

        this.assertCipherSuiteVersion(ciphertext.ver);

        plaintext = await keyJWK.decrypt(
          keyJWK.alg, ciphertext.data, {
            tag: ciphertext.tag,
            iv: ciphertext.iv
          }
        );

      } else {

        const plaintextTmp: any = await jose.JWE.createDecrypt(
          keyJWK, {
            fields: {
              alg: 'dir',
              enc: keyJWK.alg
            }
          }
        )
        .decrypt(ciphertextTmp);

        plaintext = plaintextTmp.plaintext.toString('utf8');

      }

      result.set(key, plaintext);
    }

    return result;
  }

  private async keyFromPassword(password: string, salt: Buffer) {
    const normalizedPw = Buffer.from(password.normalize('NFKD'), 'utf8');
    let keyBuffer: Buffer;

    if (this.cryptoServiceSupport.requiresSupportPbkdf2()) {
      console.log('using edge support version for kdf');
      keyBuffer = await this.cryptoServiceSupport.derivePbkdf2Support(normalizedPw,
        salt,
        CONSTANTS.KEYLENGTH[this.primitives.cipher] / 8,
        this.primitives.passwordRounds, this.primitives.passwordKDFHash);
    } else {
      // create key from password
      keyBuffer = await jose.JWA.derive(
        this.primitives.passwordKDF + '-' + this.primitives.passwordKDFHash,
        normalizedPw, {
          salt: salt,
          iterations: this.primitives.passwordRounds, // TODO experiment how high we can go
          length: CONSTANTS.KEYLENGTH[this.primitives.cipher] / 8
        }
      );
    }
    // buffer to JWK
    return await jose.JWK.asKey({
      kty: 'oct',
      k: keyBuffer,
      alg: this.primitives.cipher
    });
  }

  private async signKey(keyJWK: any): Promise<any> {
    this.assertInitializedKeystore();

    // sign the JWK and return as JWS
    return await jose.JWS.createSign({
      alg: this.keypairs.signature.alg,
      format: this.primitives.jwtFormat,
    }, this.keypairs.signature)
    .update(JSON.stringify(keyJWK.toJSON(true)))
    .final();

  }

  private async encryptKey(keyJWS: any, contentPublicKeyReceiverJWK: any): Promise<string> {

    const contentPublicKeyReceiver: any = await jose.JWK.asKey(contentPublicKeyReceiverJWK);
    this.assertSupportedPrimitives(contentPublicKeyReceiver);

    // encrypt the JWS signed JWK and return as JWE
    return await jose.JWE.createEncrypt({
      iv: jose.util.randomBytes(CONSTANTS.NONCELENGTH[this.primitives.cipher] / 8),
      format: this.primitives.jwtFormat,
      fields: {
        cty: 'jwk+json',
        alg: contentPublicKeyReceiver.alg,
        enc: this.primitives.cipher
      }
    }, contentPublicKeyReceiver)
    .update(keyJWS)
    .final();
  }

  private async decryptKey(keyJWE: string, signaturePublicKey: any): Promise<any> {
    this.assertInitializedKeystore();

    const keyJWEplain: any = await jose.JWE.createDecrypt(
      this.keypairs.content, {
        fields: {
          alg: this.keypairs.content.alg,
          enc: this.primitives.cipher
        }
      }
    )
    .decrypt(keyJWE);

    const keyJWScompact: string = keyJWEplain.plaintext.toString('utf8');

    const signaturePublicKeyJWK: any = await jose.JWK.asKey(signaturePublicKey);
    this.assertSupportedPrimitives(signaturePublicKeyJWK);

    await jose.JWS.createVerify(
      signaturePublicKeyJWK, {
        allowEmbeddedKey: false
      }
    )
    .verify(keyJWScompact);

    const keyJWSsplit: string[] = keyJWScompact.split('.');
    const keyJWKbase64: string = keyJWSsplit[1];

    return await jose.JWK.asKey(jose.util.base64url.decode(keyJWKbase64));
  }

  private async toBuffer(data: Blob | Buffer | string): Promise<Buffer> {
    let buffer: Buffer = null;

    if (data instanceof Blob) {
      buffer = await this.readAsBuffer(data as Blob);
    } else if (data instanceof Buffer) {
      buffer = data;
    } else {
      buffer = Buffer.from(data as string, 'utf8');
    }

    return buffer;
  }

  private toBlob(data: Buffer | Blob): Blob {
    let result: Blob = null;

    if (data instanceof Blob) {
      result = data;
    } else {
      result = new Blob([ data ]);
    }

    return result;
  }

  private async keysToKeystore(): Promise<any> {

    const keystore: any = jose.JWK.createKeyStore();

    await keystore.add(this.keypairs.authentication);
    await keystore.add(this.keypairs.signature);
    await keystore.add(this.keypairs.content);

    return keystore;
  }

  private isEqualPublicKey(keypair1: any, keypair2: any): boolean {

    return _.isEqual(
      _.omit(keypair1.toJSON(false), ['kid']),
      _.omit(keypair2.toJSON(false), ['kid']),
    );
  }

  private getKeyByUsage(keystore: any, usage: string): any {

    const keyFound: any = _.find(keystore.all(), function(key) {
      return key.get('usage', false) === usage;
    });

    if (typeof keyFound === 'undefined' || keyFound === null) {
      throw new Error('No keypair with usage "' + usage + '" found.');
    }

    return keyFound;
  }

  private assertInitializedKeystore() {
    if (typeof this.keypairs.authentication === 'undefined' || this.keypairs.authentication === null ||
      typeof this.keypairs.signature === 'undefined' || this.keypairs.signature === null ||
      typeof this.keypairs.content === 'undefined' || this.keypairs.content === null) {

      throw new Error('Keystore not initialized.');
    }

    this.assertSupportedPrimitives(this.keypairs.authentication);
    this.assertSupportedPrimitives(this.keypairs.signature);
    this.assertSupportedPrimitives(this.keypairs.content);
  }

  private assertSupportedPrimitives(key: any) {
    const keyJWK = key.toJSON(true);

    if (keyJWK.kty === 'EC') {

      if (!this.allowedPrimitives.curve.includes(keyJWK.crv)) {
        throw new Error('Unsupported curve ' + keyJWK.crv);
      }

      if (![ 'sig', 'enc' ].includes(keyJWK.use) ) {
        throw new Error('Unsupported key use ' + keyJWK.use);
      }

      if (keyJWK.use === 'sig' && !this.allowedPrimitives.signature.includes(keyJWK.alg)) {
        throw new Error('Unsupported signature algorithm ' + keyJWK.alg);
      }

      if (keyJWK.use === 'enc' && !this.allowedPrimitives.keyexchange.includes(keyJWK.alg)) {
        throw new Error('Unsupported key exchange algorithm ' + keyJWK.alg);
      }

    } else if (keyJWK.kty === 'oct') {

      if (keyJWK.usage !== 'token' && !this.allowedPrimitives.cipher.includes(keyJWK.alg)) {
        throw new Error('Unsupported cipher ' + keyJWK.alg);
       }

      if (keyJWK.usage === 'token' && !this.allowedPrimitives.cipherToken.includes(keyJWK.alg)) {
        throw new Error('Unsupported token cipher ' + keyJWK.alg);
      }

    } else {
      throw new Error('Unsupported key type ' + keyJWK.kty);
    }

  }

  private assertCipherSuiteVersion(version: number): void {
    if (version !== 1) {
      throw new Error('Unsupported ciphersuite version ' + version);
    }
  }
}
