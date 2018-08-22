import {RequestQueueStateEnum} from './request-queue-state.enum';

export class RequestQueueEntryState {
  constructor(public queueId: number,
              public state: RequestQueueStateEnum,
              public totalBytes: number,
              public bytesProcessed: number,
              public percentProcessed: number) {
  }
}
