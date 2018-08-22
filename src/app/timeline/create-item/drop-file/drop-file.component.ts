import {Component, EventEmitter, Input, NgZone, OnChanges, OnInit, Output, ViewChild} from '@angular/core';
import {UploadEvent} from 'ngx-file-drop';
import {environment} from '../../../../environments/environment';
import {ToastService} from '../../../shared/toast/toast.service';
import {FileWithPreview, TimeLineFileMetadata} from '../../../shared/timeline/models/timeline';
import * as PDFJS from 'pdfjs-dist/webpack';
import {b64ToBlob, blobToFile, isMobile} from '../../../core/utils/helper';

const THUMBNAIL_MAX_WIDTH = 300;
const THUMBNAIL_MAX_HEIGHT = 300;
const THUMBNAIL_TYPE = 'image/jpeg';

@Component({
  selector: 'app-drop-file',
  templateUrl: './drop-file.component.html',
  styleUrls: [],
  styles: [`
      .show {
          display: block;
      }
  `]
})
export class DropFileComponent implements OnInit, OnChanges {

  assets = environment.assets;

  @ViewChild('fileBrowse') fileBrowse;

  @Input()
  reset: boolean;

  @Input()
  disable: boolean;

  @Output()
  filesUpload = new EventEmitter<Array<FileWithPreview>>();

  data: Array<FileWithPreview> = [];
  showCameraModal: boolean;
  mimeTypeAllowed = ['application/pdf', 'image/jpeg', 'image/pjpeg', 'image/png'];
  mimeTypePdf = ['application/pdf'];
  maximumFileSize = 20971520;

  constructor(private zone: NgZone,
              private toastService: ToastService) {
  }

  ngOnInit() {
    this.showCameraModal = false;
  }

  ngOnChanges() {
    if (this.reset) {
      this.data = [];
    }
  }

  dropped(event: UploadEvent) {
    event.files
      .filter(f => f.fileEntry.file)
      .map(f => f.fileEntry.file(file => {
        // Take only the first file uploaded
        if (this.data.length === 0) {
          // this async event is outside of the zone, so _we_ need to trigger it
          this.zone.run(() => {
            this.resizeAndUpload(file);
          });
        }
      }));
  }

  selected(event) {
    const target = event.target || event.srcElement;
    if (target && target.files && target.files.length > 0) {
      const file = target.files[0];
      this.resizeAndUpload(file);
    }
    // in case the same file is selected it allows the method "(change)" to trigger again
    this.fileBrowse.nativeElement.value = '';
  }

  addPicture(file: File) {
    this.resizeAndUpload(file);
    // this.emitFile([file]);
    this.closeCamera();
  }

  removeFile(item: any) {
    this.data = this.data.filter(fileWithPreview => fileWithPreview !== item);
    this.filesUpload.emit(this.data);
  }

  transform(bytes: number = 0, precision: number = 2): string {
    const units = [
      'bytes',
      'KB',
      'MB',
      'GB',
      'TB',
      'PB'
    ];

    if (isNaN(parseFloat(String(bytes))) || !isFinite(bytes)) {
      return '?';
    }

    let unit = 0;

    while (bytes >= 1024) {
      bytes /= 1024;
      unit++;
    }

    return bytes.toFixed(+precision) + ' ' + units[unit];
  }

  showCamera() {
    this.showCameraModal = true;
  }

  closeCamera() {
    this.showCameraModal = false;
  }

  isMobile() {
    return isMobile();
  }

  private validFile(file: File): boolean {
    if (!this.mimeTypeAllowed.find(mimeType => mimeType === file.type)) {
      this.toastService.error('dropFile.toast.error.file.type.message', 'dropFile.toast.title');
      return false;
    }
    if (file.size > this.maximumFileSize) {
      this.toastService.error('dropFile.toast.error.file.size.message', 'dropFile.toast.title');
      return false;
    }
    return true;
  }

  private mapFileToFileWithMetadata(file: File): TimeLineFileMetadata {
    if (file) {
      return {
        name: file.name,
        size: this.transform(file.size),
        type: file.type
      };
    }
    return null;
  }

  private emitFile(originalFile: File, thumbnail?: File) {
    if (!originalFile) {
      return;
    }

    const result = new FileWithPreview();
    result.originalFileMetadata = this.mapFileToFileWithMetadata(originalFile);
    result.originalFile = originalFile;
    if (thumbnail) {
      result.thumbnail = thumbnail;
    }
    this.data.push(result);
    this.filesUpload.emit(this.data);
  }

  private resizeAndUpload(file: File) {
    if (!this.validFile(file)) {
      return;
    }
    const reader = new FileReader();

    if (this.mimeTypePdf.find(mimeType => mimeType === file.type)) {
      reader.onloadend = () => this.loadPdfReader(reader, file);
      reader.readAsDataURL(file);
    } else {
      reader.onloadend = () => this.loadReader(reader, file);
      reader.readAsDataURL(file);
    }
  }

  private loadPdfReader(reader, file) {
    PDFJS.disableWorker = true;
    new PDFJS.getDocument(reader.result)
      .then(pdf => {
      return pdf.getPage(1);

    }).then(page => {

      const unscaledViewport = page.getViewport(1);
      const scale = Math.min((THUMBNAIL_MAX_HEIGHT / unscaledViewport.height), (THUMBNAIL_MAX_HEIGHT / unscaledViewport.width));
      const viewport = page.getViewport(scale);

      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      canvas.height = viewport.height;
      canvas.width = viewport.width;
      //
      // Render PDF page into canvas context
      //
      const task = page.render({canvasContext: context, viewport: viewport});
      task.promise.then(() => {
        const dataURL = canvas.toDataURL(THUMBNAIL_TYPE);
        const blob = b64ToBlob(dataURL, THUMBNAIL_TYPE);
        const name = file.name.slice(0, file.name.lastIndexOf('.'));
        // NOTE: new File() is not supported in Edge, use Blob instead
        this.emitFile(file, blobToFile(blob, name + '_thumbnail'));
      });
    }).catch(() => {
      this.toastService.error('dropFile.toast.error.file.invalidPdf.message', 'dropFile.toast.title');
    });
  }

  private loadReader(reader, file) {
    const tempImg = new Image();
    tempImg.src = reader.result;
    tempImg.onload = () => this.loadTempImage(tempImg, file);
  }

  private loadTempImage(tempImg, file) {

    let tempW = tempImg.width;
    let tempH = tempImg.height;
    if (tempW > tempH) {
      if (tempW > THUMBNAIL_MAX_WIDTH) {
        tempH *= THUMBNAIL_MAX_WIDTH / tempW;
        tempW = THUMBNAIL_MAX_WIDTH;
      }
    } else {
      if (tempH > THUMBNAIL_MAX_HEIGHT) {
        tempW *= THUMBNAIL_MAX_HEIGHT / tempH;
        tempH = THUMBNAIL_MAX_HEIGHT;
      }
    }

    const canvas = document.createElement('canvas');
    canvas.width = tempW;
    canvas.height = tempH;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, tempW, tempH);
    ctx.drawImage(tempImg, 0, 0, tempW, tempH);
    const dataURL = canvas.toDataURL(THUMBNAIL_TYPE);
    const blob = b64ToBlob(dataURL, THUMBNAIL_TYPE);
    const name = file.name.slice(0, file.name.lastIndexOf('.'));
    // NOTE: new File() is not supported in Edge, use Blob instead
    this.emitFile(file, blobToFile(blob, name + '_thumbnail'));
  }

}
