import {ItemType} from './enums/item-type.enum';
import {DateTime, PureDate, PureTime} from '../../date/date.type';
import {ObjectWithPermission} from '../../permission/permission';

export const RESPONSE_CONTINUATION_HEADER = 'x-response-continuation';

/**
 * Model for create a TimeLineItem
 */
export class TimeLineItem extends ObjectWithPermission {
  id?: string;
  reference: string;
  owner: string;
  itemType: ItemType;
  time: DateTime;
  uploadTime: DateTime;
  metadata: TimeLineMetaData;
  fileMetadata: TimeLineFileMetadata;
  contentReference: string;
  thumbnailReference: string;
  content?: Blob;
  thumbnail?: Blob;
  requestQueueId?: number;
  markedForDeletion?: boolean;
}

export class TimeLineItemEncrypted extends ObjectWithPermission {
  id?: string;
  reference: string;
  owner: string;
  itemType: ItemType;
  time: DateTime;
  uploadTime: DateTime;
  metadata: string;
  fileMetadata: string;
  contentReference: string;
  thumbnailReference?: string;
}

export class TimeLineItemEncryptedWithContent {
  timelineItemEncrypted: TimeLineItemEncrypted;
  content: Blob;
  thumbnail: Blob;
}

export class TimeLineMetaData {
  title: string;
  creationDate: PureDate;
  creationTime: PureTime;
  tags?: string[];
}

export class TimeLineFileMetadata {
  name: string;
  size: string;
  type: any;
}

export class TimelineResponseContinuation {
  timelineItems: TimeLineItem [];
  responseContinuation?: string;
}

export class FileWithPreview {
  originalFileMetadata: TimeLineFileMetadata;
  originalFile: File;
  thumbnail: File;
}
