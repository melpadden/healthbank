import {RequestTypeEnum} from './request-type.enum';

export class RequestQueueEntry {
  public queueId: number;

  constructor(public requestType: RequestTypeEnum,
              public timestamp: number,
              // backend url, optional including url encoded url-params
              public requestUrl: string,
              // PUT, POST or DELETE
              public httpMethod: string,
              // serialize able object or binary
              public jsonData: any,
              public thumbnail: any,
              public binaryData: any,
              public successCallback: string,
              public errorCallback: string,
              public bytes: number) {
  }
}
