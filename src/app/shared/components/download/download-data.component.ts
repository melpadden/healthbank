import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {saveAs} from 'file-saver';

@Component({
  selector: 'app-download-data',
  template: `
    <a target="_blank"
       (click)="$event.stopPropagation(); clickedDownload();">{{linkText}}</a>
  `,
  styles: []
})
export class DownloadDataComponent implements OnInit {

  @Input() data: any;
  @Input() filename: string;
  @Input() type: string;
  @Input() linkText: string;
  @Output() success = new EventEmitter<boolean>();

  constructor() {
  }

  ngOnInit(): void {
  }

  clickedDownload() {
    if (!this.data) {
      return;
    }
    this.downloadFile();
    this.success.emit(true);
  }

  private downloadFile() {
    let blob: Blob;
    if (this.data instanceof Blob) {
      blob = this.data;
    } else {
      blob = new Blob([this.data], {type: this.type});
    }
    saveAs(blob, this.filename);
  }
}
