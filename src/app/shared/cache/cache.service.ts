import {Injectable} from '@angular/core';
import 'rxjs/add/operator/share';
import {ContactDecrypted} from '../contact/models/contact';
import {Identity} from '../user/enrollment';

/**
 * Cache Service.
 */
@Injectable()
export class CacheService {

  private readonly CACHE_EXPIRATION_MS: number = 600000;
  private _contactsMap: Map<string, ContactDecrypted> = new Map<string, ContactDecrypted>();
  private _identitiesMap: Map<string, Identity> = new Map<string, Identity>();
  private contactsLoadedAt: Date;

  constructor() {
  }

  invalidateAllCaches() {
    this.resetIdentitiesMap();
    this.resetContacts();
  }

  getContactsMap(): Map<string, ContactDecrypted> {
    return this._contactsMap;
  }

  getIdentitiesMap(): Map<string, Identity> {
    return this._identitiesMap;
  }

  removeContactFromCache(contactUuid: string) {
    this._contactsMap.delete(contactUuid);
  }

  public setContactsLoadedNow() {
    this.contactsLoadedAt = new Date();
  }

  public isContactsCacheStale(): boolean {
    return this.contactsLoadedAt && this.contactsLoadedAt >= new Date(new Date().getTime() - this.CACHE_EXPIRATION_MS);
  }

  public resetContacts() {
    this.resetContactsLoaded();
    this.resetContactMap();
  }

  public resetContactsLoaded() {
    this.contactsLoadedAt = undefined;
  }

  private resetContactMap() {
    this._contactsMap.clear();
  }

  private resetIdentitiesMap() {
    this._identitiesMap.clear();
  }

}
