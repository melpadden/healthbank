import {Component, OnInit} from '@angular/core';
import {RequestQueueService} from './request-queue.service';

@Component({
  selector: 'app-request-queue-state',
  templateUrl: './request-queue-state.component.html',
  styleUrls: []
})
export class RequestQueueStateComponent implements OnInit {

  constructor(private requestQueueService: RequestQueueService) {
  }

  ngOnInit() {
    this.requestQueueService.initQueueWorker();
  }

  getCurrentQueueState(): string {
    return this.requestQueueService.getRequestQueueState();
  }

  getQueuedRequestCount(): number {
    return this.requestQueueService.getQueuedRequestCount();
  }

  getCurrentQueueSize(): number {
    return Math.round(this.requestQueueService.getQueuedRequestBytes() / 1024);
  }

  getCurrentSize() {
    return Math.round(this.requestQueueService.getCurrentRequestBytes() / 1024);
  }

  getCurrentUploadProgressPercent(): number {
    return this.requestQueueService.getCurrentProgressPercent();
  }

  clearUploadQueue(): void {
    this.requestQueueService.clearQueue();
  }
}

