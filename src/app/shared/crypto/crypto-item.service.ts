import {Injectable} from '@angular/core';
import {Contact, ContactDecrypted} from '../contact/models/contact';
import {Observable} from 'rxjs/Observable';
import {CryptoService} from './crypto.service';
import 'rxjs/add/operator/map';
import {Identity, IdentityDecrypted} from '../user/enrollment';
import {
  TimeLineFileMetadata, TimeLineItem, TimeLineItemEncrypted,
  TimeLineItemEncryptedWithContent, TimeLineMetaData
} from '../timeline/models/timeline';
import {AuthService} from '../auth/auth.service';

/**
 * Wrappers for de/encryption of healthbank-related objects.
 */
@Injectable()
export class CryptoItemService {


  constructor(private cryptoService: CryptoService,
              private authService: AuthService) {
  }

  decryptContact(contact: Contact, userId: string): Observable<ContactDecrypted> {
    const decrypt = new Map();
    decrypt.set('contact', contact.contactInfo);
    return Observable.fromPromise(this.cryptoService.decrypt(decrypt, contact.users[userId].key))
      .map(decrypted => {
        const result = new ContactDecrypted();
        result.userId = contact.userId;
        result.invitationId = contact.invitationId;
        result.contactInfo = JSON.parse(decrypted.get('contact') as string);
        return result;
      });
  }

  decryptIdentity(identity: Identity, userId: string): Observable<IdentityDecrypted> {
    const decrypt = new Map();
    decrypt.set('identity', identity.profileBlob);
    return Observable.fromPromise(this.cryptoService.decrypt(decrypt, identity.users[userId].key))
      .map(decrypted => {
        const result = new IdentityDecrypted();
        result.id = identity.id;
        result.authenticationKey = identity.authenticationKey;
        result.signatureKey = identity.signatureKey;
        result.contentKey = identity.contentKey;
        result.profile = JSON.parse(decrypted.get('identity') as string);
        return result;
      });
  }

  decryptTimeLineItem(item: TimeLineItemEncrypted, thumbnail?: any): Promise<TimeLineItem> {
    const decrypt = new Map();
    decrypt.set('metadata', item.metadata);
    decrypt.set('fileMetadata', item.fileMetadata);
    if (thumbnail) {
      decrypt.set('thumbnail', thumbnail);
    }
    return this.cryptoService.decrypt(decrypt, item.users[this.authService.getSessionUser().userId].key)
      .then(value => {
        return this.mapToDecrypted(item, value.get('metadata') as string,
          value.get('fileMetadata') as string, value.get('thumbnail') as Blob);
      });
  }

  decryptSharedTimeLineItem(item: TimeLineItemEncrypted, identityObs: Observable<Identity>, thumbnail?: any): Promise<TimeLineItem> {
    const decrypt = new Map();
    decrypt.set('metadata', item.metadata);
    decrypt.set('fileMetadata', item.fileMetadata);
    if (thumbnail) {
      decrypt.set('thumbnail', thumbnail);
    }
    return identityObs.toPromise()
      .then(identity => {
        return this.cryptoService.decryptShared(decrypt, item.users[this.authService.getSessionUser().userId].key, identity.signatureKey);
      })
      .then(value => {
        const decrypted: TimeLineItem = this.mapToDecrypted(item, value.get('metadata') as string,
          value.get('fileMetadata') as string, value.get('thumbnail') as Blob) as TimeLineItem;
        return decrypted;
      });
  }

  encryptTimeLineItem(item: TimeLineItem): Promise<TimeLineItemEncryptedWithContent> {
    const encrypt = new Map();
    encrypt.set('metadata', JSON.stringify(item.metadata));
    encrypt.set('fileMetadata', JSON.stringify(item.fileMetadata));
    if (item.content) {
      encrypt.set('content', item.content);
    }
    if (item.thumbnail) {
      encrypt.set('thumbnail', item.thumbnail);
    }

    return this.cryptoService.encrypt(encrypt)
      .then((encrypted) => {
        item.users = {[this.authService.getSessionUser().userId]: {key: encrypted[0]}};
        const encryptedWithContent: TimeLineItemEncryptedWithContent = new TimeLineItemEncryptedWithContent();
        encryptedWithContent.timelineItemEncrypted =
          this.mapToEncrypted(item, encrypted[1].get('metadata') as string, encrypted[1].get('fileMetadata') as string);
        encryptedWithContent.content = encrypted[1].get('content') as Blob;
        encryptedWithContent.thumbnail = encrypted[1].get('thumbnail') as Blob;
        return encryptedWithContent;
      });
  }

  private mapToEncrypted(item: TimeLineItem, metadata: string, fileMetadata: string): TimeLineItemEncrypted {
    const result: TimeLineItemEncrypted = new TimeLineItemEncrypted();
    result.id = item.id;
    result.reference = item.reference;
    result.owner = item.owner;
    result.itemType = item.itemType;
    result.time = item.time;
    result.uploadTime = item.uploadTime;
    result.users = item.users;
    result.metadata = metadata;
    result.fileMetadata = fileMetadata;
    result.contentReference = item.contentReference;
    result.thumbnailReference = item.thumbnailReference;
    return result;
  }

  private mapToDecrypted(item: TimeLineItemEncrypted, metadata: string, fileMetadata: string, thumbnail?: Blob): TimeLineItem {
    const result: TimeLineItem = new TimeLineItem();
    result.id = item.id;
    result.reference = item.reference;
    result.owner = item.owner;
    result.itemType = item.itemType;
    result.time = item.time;
    result.uploadTime = item.uploadTime;
    result.users = item.users;
    result.contentReference = item.contentReference;
    result.thumbnailReference = item.thumbnailReference;
    try {
      result.metadata = JSON.parse(metadata);
    } catch (e) {
      console.warn(`mapTimeLine could not parse metaData json of timeLine item with reference: ${item.reference}`);
      result.metadata = new TimeLineMetaData();
    }
    try {
      result.fileMetadata = JSON.parse(fileMetadata);
    } catch (e) {
      console.warn(`mapTimeLine could not parse fileMetaData json of timeLine item with reference: ${item.reference}`);
      result.fileMetadata = new TimeLineFileMetadata();
    }
    result.thumbnail = thumbnail;
    return result;
  }


}
