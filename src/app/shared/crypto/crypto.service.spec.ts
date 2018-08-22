import * as uuidv1 from 'uuid/v1';
import * as jose from 'node-jose';
import {CryptoService} from './crypto.service';
import {async, TestBed} from '@angular/core/testing';
import {CryptoServiceSupport} from './crypto.service.support';

describe('CryptoService', () => {
  let cryptoService: CryptoService;
  let cryptoServiceSupportStub: CryptoServiceSupport;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      providers: [CryptoService, {provide: CryptoServiceSupport, useClass: CryptoServiceSupportStub}]
    });

    cryptoService = TestBed.get(CryptoService);
    cryptoServiceSupportStub = TestBed.get(CryptoServiceSupport);
    cryptoServiceSupportStub.requiresSupportPbkdf2 = () => false;
  }));

  it('should create an crypto service instance', () => {
    expect(cryptoService).toBeDefined();
    expect(cryptoServiceSupportStub).toBeDefined();
    expect(cryptoServiceSupportStub.requiresSupportPbkdf2()).toBeFalsy();
  });

  it('registration', async () => {
    // 1 Client create        S_C^A, P_C^A, S_C^S, P_C^S, S_C^C, P_C^C
    // 2 Client send          P_C^A, P_C^s, P_C^c
    // Generates all necessary keypairs. Private keys are stored inside the
    // crypto object and will never leave it unencrypted. Returns the public
    // keys as a JWK-set which should be sent to the IdP.
    let publicKeys = await cryptoService.generateKeypairs();

    expect(publicKeys).toBeDefined();
    expect(publicKeys.authenticationKey).toBeDefined();
    expect(publicKeys.signatureKey).toBeDefined();
    expect(publicKeys.contentKey).toBeDefined();
    expect(publicKeys.authenticationKey.usage).toEqual('authentication');
    expect(publicKeys.signatureKey.usage).toEqual('signature');
    expect(publicKeys.contentKey.usage).toEqual('content');

    // 3 IdP create and store     i_C, rc_I, P_C^A, P_C^s, P_C^c
    // 4 IdP send                 i_C
    // 5 IdP send (2nd channel)   rc_I
    const userId = uuidv1();
    const registrationCode = jose.util.randomBytes(8).toString('hex');

    // The server returns all sent public keys with newly generated key ids.
    // For every returned key updateKeyId() is called, which updates the kid
    // for the keypair with the matching public key parameters.

    publicKeys.authenticationKey.kid = uuidv1();
    let newKey = await cryptoService.updateKeyId(publicKeys.authenticationKey);
    expect(newKey.kid).toEqual(publicKeys.authenticationKey.kid);

    publicKeys.signatureKey.kid = uuidv1();
    newKey = await cryptoService.updateKeyId(publicKeys.signatureKey);
    expect(newKey.kid).toEqual(publicKeys.signatureKey.kid);

    publicKeys.contentKey.kid = uuidv1();
    newKey = await cryptoService.updateKeyId(publicKeys.contentKey);
    expect(newKey.kid).toEqual(publicKeys.contentKey.kid);


    publicKeys = await cryptoService.exportPublicKeys();
    expect(publicKeys.authenticationKey.usage).toEqual('authentication');
    const authPubKey = publicKeys.authenticationKey;

    // 6 Client send        i_C ∪ rc_I ∪ S_{S_C^A} ( H ( i_C ∪ rc_I ) )

    // Create the JWS confirmation code based on userId and registrationCode.
    // The result may be sent directly to the server.
    const confirmation = await cryptoService.createRegistrationConfirmation(userId, registrationCode);

    const parts = confirmation.split('.');
    expect(parts.length).toEqual(3);
    const header = JSON.parse(jose.util.base64url.decode(parts[0]).toString('utf8'));
    expect(header.kid).toEqual(authPubKey.kid);
    expect(header.alg).toEqual('ES384');
    const payload = JSON.parse(jose.util.base64url.decode(parts[1]).toString('utf8'));
    expect(payload.sub).toEqual(userId);
    expect(payload.code).toEqual(registrationCode);
    const signature = parts[2];
    expect(signature.length).toEqual(128);

    const authtokenVerified = await jose.JWS.createVerify(
      await jose.JWK.asKey(authPubKey),
      {
        allowEmbeddedKey: false
      }
    )
      .verify(confirmation);
  });

  it('export/import keystore', async () => {
    await cryptoService.generateKeypairs();

    const publicKeys = await cryptoService.exportPublicKeys();
    expect(publicKeys).toBeDefined();
    expect(publicKeys.authenticationKey).toBeDefined();
    expect(publicKeys.signatureKey).toBeDefined();
    expect(publicKeys.contentKey).toBeDefined();
    expect(publicKeys.authenticationKey.usage).toEqual('authentication');
    expect(publicKeys.signatureKey.usage).toEqual('signature');
    expect(publicKeys.contentKey.usage).toEqual('content');

    // 8 Client store                         i_C
    // This is out of crypto service's scopy

    // 9 Client encrypt and store             S_C^s, P_C^s, S_C^c, P_C^ci_C, S_C^s, P_C^s, S_C^c, P_C^c

    // Export all keys encrypted using the provided password. A non standard property 'passwordsald' is
    // attached to the returned JWK-set which has to be retained at all cost.
    const keystore = await cryptoService.exportKeystore('s3crEtP4sSW0rD');
    const parts = keystore.split('.');
    expect(parts.length).toEqual(5);

    const header = JSON.parse(jose.util.base64url.decode(parts[0]).toString('utf8'));
    expect(header.alg).toEqual('dir');
    expect(header.enc).toEqual('A256GCM');
    expect(header.cty).toEqual('jwk-set+json');
    expect(header.passwordsalt).toBeDefined();
    expect(header.passwordsalt.length).toEqual(64);
    expect(parts[1]).toEqual('');
    expect(parts[2].length).toBeGreaterThan(0);
    expect(parts[3].length).toBeGreaterThan(0);
    expect(parts[4].length).toBeGreaterThan(0);

    // Import the previously exported keys and test for equality.
    const publicKeysImported = await cryptoService.importKeystore(keystore, 's3crEtP4sSW0rD');
    expect(publicKeysImported).toBeDefined();
    expect(publicKeysImported.authenticationKey).toBeDefined();
    expect(publicKeysImported.signatureKey).toBeDefined();
    expect(publicKeysImported.contentKey).toBeDefined();
    expect(publicKeysImported.authenticationKey.usage).toEqual('authentication');
    expect(publicKeysImported.signatureKey.usage).toEqual('signature');
    expect(publicKeysImported.contentKey.usage).toEqual('content');

    expect(publicKeys.authenticationKey).toEqual(publicKeysImported.authenticationKey);
    expect(publicKeys.signatureKey).toEqual(publicKeysImported.signatureKey);
    expect(publicKeys.contentKey).toEqual(publicKeysImported.contentKey);

    cryptoService.clearKeystore();
    try {
      cryptoService.exportPublicKeys();
      fail('clearKeystore failed');
    } catch (err) {
    }
  });

  it('authentication', async () => {
    const publicKeys = await cryptoService.generateKeypairs();

    expect(publicKeys).toBeDefined();
    expect(publicKeys.authenticationKey).toBeDefined();
    expect(publicKeys.authenticationKey.usage).toEqual('authentication');

    // 1 Client send        i_C

    // Get and send kid of loaded authentication key to server.
    const keyId = cryptoService.getAuthenticationKeyId();
    expect(keyId).toEqual(publicKeys.authenticationKey.kid);

    // 2 IdP compute        challenge = n_I ∪ t_I ∪ i_C
    // 3 IdP send           challenge ∪ S_{S_I^s}(H(challenge))
    const seconds = Math.floor((new Date().getTime() + 1000) / 1000);
    const jwtid = jose.util.randomBytes(4).toString('hex');

    const token = {
      challenge: {
        kid: keyId,  // i_C
        exp: seconds,  // t_I + ttl_I
        jti: jwtid   // n_I
      },
      cookie: {some: 'data'} // irrelevant
    };

    try {

      // 4 Client send        challenge ∪ S_{S_I^s}(H(challenge)) ∪ S_{S_C^s}(H(challenge))

      // Awaits an object containing at least the property challenge. Adds the signed challenge
      // as property proof. Send tokenSigned to the server for authentication.
      const tokenSigned = await cryptoService.createAuthenticationToken(token);
      expect(tokenSigned.challenge).toEqual(token.challenge);
      expect(tokenSigned.cookie).toEqual(token.cookie);
      expect(tokenSigned.proof).toBeDefined();

      // 6a SUCCESS IdP compute     jwt_C = s_C ∪ S_{S_I^s}(s_C)
      const cookieReturned = await jose.JWS.createVerify(
        await jose.JWK.asKey(publicKeys.authenticationKey), {
          allowEmbeddedKey: false
        })
        .verify(tokenSigned.proof);

      const parts = tokenSigned.proof.split('.');
      expect(parts.length).toEqual(3);
      const header = JSON.parse(jose.util.base64url.decode(parts[0]).toString('utf8'));
      expect(header.kid).toEqual(publicKeys.authenticationKey.kid);
      expect(header.alg).toEqual('ES384');
      const payload = JSON.parse(jose.util.base64url.decode(parts[1]).toString('utf8'));
      expect(payload.kid).toEqual(keyId);
      expect(payload.exp).toEqual(seconds);
      expect(payload.jti).toEqual(jwtid);
      const signature = parts[2];
      expect(signature.length).toEqual(128);

    } catch (err) {
      fail(err.message);
    }
  });

  it('encrypt / decrypt', async () => {

    const publicKeys = await cryptoService.generateKeypairs();
    const plaintext1: Buffer = new Buffer([0, 1, 2, 3]);
    const plaintext2: Buffer = new Buffer([4, 3, 2, 1, 0]);
    const plaintext3 = 'first test string';
    const plaintext4 = 'second test string';

    const plaintexts: Map<string, Blob | string> = new Map(Object.entries({
      'blob1': new Blob([plaintext1]),
      'blob2': new Blob([plaintext2]),
      'string1': plaintext3,
      'string2': plaintext4
    }));

    const retval: [string, Map<string, Blob | string>] = await cryptoService.encrypt(plaintexts);

    const keyJWE: string = retval[0];
    const ciphertexts: Map<string, Blob | string> = retval[1];

    const plaintextResult: Map<string, Blob | string> = await cryptoService.decrypt(ciphertexts, keyJWE);

    let plaintextBlob: Buffer = await cryptoService.readAsBuffer(plaintextResult.get('blob1') as Blob);
    expect(Buffer.compare(plaintext1, plaintextBlob)).toEqual(0);
    expect(Buffer.compare(plaintext2, plaintextBlob)).not.toEqual(0);

    plaintextBlob = await cryptoService.readAsBuffer(plaintextResult.get('blob2') as Blob);
    expect(Buffer.compare(plaintext2, plaintextBlob)).toEqual(0);
    expect(Buffer.compare(plaintext1, plaintextBlob)).not.toEqual(0);

    let plaintextString = plaintextResult.get('string1');
    expect(plaintextString).toEqual(plaintext3);
    expect(plaintextString).not.toEqual(plaintext4);

    plaintextString = plaintextResult.get('string2');
    expect(plaintextString).toEqual(plaintext4);
    expect(plaintextString).not.toEqual(plaintext3);

  });

  it('share content encryption keys', async () => {
    const cryptoSender = new CryptoService(cryptoServiceSupportStub);
    const senderPublicKeys = await cryptoSender.generateKeypairs();

    const cryptoReceiver1 = new CryptoService(cryptoServiceSupportStub);
    const receiver1PublicKeys = await cryptoReceiver1.generateKeypairs();

    const cryptoReceiver2 = new CryptoService(cryptoServiceSupportStub);
    const receiver2PublicKeys = await cryptoReceiver2.generateKeypairs();

    const plaintextBuffer: Buffer = new Buffer([0, 1, 2, 3]);
    const plaintextBuffer2: Buffer = new Buffer(Array.from(Array(256).keys()));
    const plaintextString = 'first test string';

    const plaintexts: Map<string, Blob | string> = new Map(Object.entries({
      'blob': new Blob([plaintextBuffer]),
      'string': plaintextString,
    }));

    const receiverContentPublicKeys: Map<string, string> = new Map(Object.entries({
      'receiver1': receiver1PublicKeys.contentKey,
      'receiver2': receiver2PublicKeys.contentKey,
    }));

    const encrypted: [string, Map<string, Blob | string>] = await cryptoSender.encrypt(plaintexts);
    const keyJWE: string = encrypted[0];
    const ciphertexts: Map<string, Blob | string> = encrypted[1];

    const sharedKeys: Map<string, string> = await cryptoSender.share(keyJWE, receiverContentPublicKeys);
    expect(sharedKeys.get('receiver1')).toBeDefined();
    expect(sharedKeys.get('receiver2')).toBeDefined();

    const receiver1Result: Map<string, Blob | string> = await cryptoReceiver1.decryptShared(
      ciphertexts, sharedKeys.get('receiver1'), senderPublicKeys.signatureKey
    );
    expect(receiver1Result.get('blob')).toBeDefined();
    expect(receiver1Result.get('string')).toBeDefined();

    let plaintextBufferTmp: Buffer = await cryptoReceiver1.readAsBuffer(receiver1Result.get('blob') as Blob);
    expect(Buffer.compare(plaintextBuffer, plaintextBufferTmp)).toEqual(0);
    let plaintextStringTmp = receiver1Result.get('string');
    expect(plaintextStringTmp).toEqual(plaintextString);

    const receiver2Result: Map<string, Blob | string> = await cryptoReceiver2.decryptShared(
      ciphertexts, sharedKeys.get('receiver2'), senderPublicKeys.signatureKey
    );
    expect(receiver2Result.get('blob')).toBeDefined();
    expect(receiver2Result.get('string')).toBeDefined();

    plaintextBufferTmp = await cryptoReceiver2.readAsBuffer(receiver2Result.get('blob') as Blob);
    expect(Buffer.compare(plaintextBuffer, plaintextBufferTmp)).toEqual(0);
    plaintextStringTmp = receiver2Result.get('string');
    expect(plaintextStringTmp).toEqual(plaintextString);

    try {

      await cryptoReceiver1.decryptShared(
        ciphertexts, sharedKeys.get('receiver2'), senderPublicKeys.signatureKey
      );
      fail('receiver1 can decrypt receiver2 private data!');

    } catch (err) {
    }

    try {

      await cryptoReceiver2.decryptShared(
        ciphertexts, sharedKeys.get('receiver1'), senderPublicKeys.signatureKey
      );
      fail('receiver2 can decrypt receiver1 private data!');

    } catch (err) {
    }

  });

  it('contact token', async () => {

    const cryptoA = new CryptoService(cryptoServiceSupportStub);
    const publicKeysA = await cryptoA.generateKeypairs();
    expect(publicKeysA).toBeDefined();

    const cryptoB = new CryptoService(cryptoServiceSupportStub);
    const publicKeysB = await cryptoB.generateKeypairs();
    expect(publicKeysB).toBeDefined();

    const plaintextsA: Map<string, Blob | string> = new Map(Object.entries({
      'data': JSON.stringify({
        name: 'Max Mustermann',
        email: 'max@mustermann.ch',
      }),
      'moredata': new Blob([Array.from(Array(256).keys())])
    }));

    const plaintextsB: Map<string, Blob | string> = new Map(Object.entries({
      'data': JSON.stringify({
        name: 'Erika Musterfrau',
        email: 'erika@musterfrau.ch'
      })
    }));

    /*
     * A (Max) creates contact token and encrypt contact data for B (Erika)
     */
    const ciphertextsA = await cryptoA.encryptTokenKey(plaintextsA);

    expect(ciphertextsA.length).toEqual(3);

    const dataA = ciphertextsA[0];
    expect(dataA instanceof Map).toBeTruthy();
    expect(dataA.get('data')).toBeDefined();

    const token = ciphertextsA[1];
    expect(typeof token).toEqual('string');
    const tokenLength = token.split('-').join('').length;
    expect(tokenLength >= 16 && tokenLength <= 22).toBeTruthy();

    const id = ciphertextsA[2];
    expect(typeof id).toEqual('string');
    expect(id.length).toEqual(64);

    /*
     * B (Erika) decrypt contact data using token received from A (Max)
     */
    const contactA = await cryptoB.decryptTokenKey(dataA, token);

    expect(contactA instanceof Map).toBeTruthy();

    const contactDataA = contactA.get('data');
    expect(contactDataA).toBeDefined();
    expect(contactDataA).toEqual(plaintextsA.get('data'));

    const moreDataA = contactA.get('moredata');
    expect(moreDataA).toBeDefined();
    const moreDataABuffer: Buffer = await cryptoA.readAsBuffer(contactA.get('moredata') as Blob);
    const moreDataAOrigBuffer: Buffer = await cryptoA.readAsBuffer(plaintextsA.get('moredata') as Blob);
    expect(Buffer.compare(moreDataABuffer, moreDataAOrigBuffer)).toEqual(0);

    /*
     * B (Erika) creates answer and encrypts her contact data for A (Max)
     */
    const ciphertextsB = await cryptoB.encryptTokenKey(plaintextsB, token);

    expect(ciphertextsB.length).toEqual(3);

    const dataB = ciphertextsB[0];
    expect(dataB instanceof Map).toBeTruthy();
    expect(dataB.get('data')).toBeDefined();

    expect(ciphertextsB[1]).toEqual(token);

    expect(ciphertextsB[2]).toEqual(id);

    /*
     * A (Max) decrypts answer using token previously sent to B (Erika)
     */
    const contactB = await cryptoA.decryptTokenKey(dataB, token);

    expect(contactB instanceof Map).toBeTruthy();

    const contactDataB = contactB.get('data');
    expect(contactDataB).toBeDefined();
    expect(contactDataB).toEqual(plaintextsB.get('data'));
  });

});

class CryptoServiceSupportStub extends CryptoServiceSupport {

}
