/**
 * Model for enrollment request
 */
import {ObjectWithPermission} from '../permission/permission';
import {User} from './user-data';

export class EnrollmentRequest {
  email: string;
  contentKey: object;
  signatureKey: object;
  authenticationKey: object;
}

/**
 * Model for enrollment confirmation
 */
export class EnrollmentConfirmation extends ObjectWithPermission {
  jwt: string;
  profileBlob: string;
}

/**
 * Model for enrollment code request
 */
export class EnrollmentCodeRequest {
  jwt: string;
  email: string;
}

export class Identity extends ObjectWithPermission {
  id: string;
  contentKey: string;
  signatureKey: string;
  authenticationKey: string;
  profileBlob: string;
}

export class IdentityDecrypted extends ObjectWithPermission {
  id: string;
  contentKey: string;
  signatureKey: string;
  authenticationKey: string;
  profile: User;
}
