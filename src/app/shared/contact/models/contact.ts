import {DateTime} from '../../date/date.type';
import {ObjectWithPermission} from '../../permission/permission';

export class Contact extends ObjectWithPermission {
  // Identity of the user that has this contact in the address book
  userId?: string;
  // base64-encoded encrypted address book entry, consisting of (userId,firstname,lastname,email)
  contactInfo: string;
  invitationId: string;
}

export class ContactDecrypted extends ObjectWithPermission {
  userId?: string;
  contactInfo: ContactInfo;
  invitationId: string;
  shared?: SharedInformation;
}

export class SharedInformation {
  itemsSharedWithMe: number;
  itemsSharedWithContact: number;
}

export class ContactInfo {
  firstname: string;
  lastname: string;
  email: string;
  userId: string;
  phone: string;
}

export class Invitation {
  // Code for invitation lookup.
  id: string;
  // base64 encoded, symetrically encrypted contact info(userId,firstname,lastname,email) of the person that created the invitation.
  transientContactInfo: string;
  // Invitation if valid until this Instant.
  validUntil: DateTime;
}

export class InvitationDB extends Invitation {
  owner: string;
  token: string;
}

export class InvitationDecrypted {
  id: string;
  transientContactInfo: ContactInfo;
  validUntil: DateTime;
}
