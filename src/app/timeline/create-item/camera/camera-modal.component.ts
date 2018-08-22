import { Component, EventEmitter, NgZone, OnInit, Output } from '@angular/core';
import { WebCamComponent } from 'ack-angular-webcam';
import { ToastService } from '../../../shared/toast/toast.service';
import * as moment from 'moment';
import { AckMediaDevices } from 'ack-angular-webcam/AckMediaDevices.directive';
import { TranslateService } from '@ngx-translate/core';
import {b64ToBlob, blobToFile} from '../../../core/utils/helper';

@Component({
  selector: 'app-camera-modal',
  templateUrl: './camera-modal.component.html',
  styles: [`
    .modal-body {
      text-align: center;
    }
    .camera-error {
      color: #C90000;
    }
  `]
})
export class CameraModalComponent implements OnInit {

  @Output()
  close = new EventEmitter<void>();

  @Output()
  add = new EventEmitter<File>();

  webcam: WebCamComponent;
  cameras: MediaDeviceInfo[];
  selectedCamera: MediaDeviceInfo;
  cameraInit: boolean;
  mimeType = 'image/jpeg';
  mediaDevices = new AckMediaDevices;
  cameraErrorMessage: string;

  constructor(private zone: NgZone,
              private toastService: ToastService,
              private translate: TranslateService) { }

  ngOnInit() {
  }

  closeCamera() {
    this.close.emit();
  }

  addPicture() {
    // NOTE: since ack-webcam has methods that return a form data with the content, the base64 image must be used to create the file.
    this.webcam.getBase64(this.mimeType)
      .then(b64Image => {
        // const b64Content = b64Image.replace('data:' + this.mimeType + ';base64,', '');
        // NOTE: new File() is not supported in Edge, use Blob instead
        const file: File = blobToFile(b64ToBlob(b64Image, this.mimeType),
          'image-' + moment(Date.now()).format('YYYYMMDD_hhmmss') + '.jpg');

        // async
        this.zone.run(() => {
          this.add.emit(file);
        });
      }).catch(error => {
        console.error(error);
      });
  }

  cameraSuccess(event) {
    this.cameraInit = true;
    this.cameraErrorMessage = null;
    // to update the device label after the auth (Firefox)
    if (!this.cameras) {
      this.initVideoDevices();
    }
  }

  cameraError(error) {
    this.cameraInit = false;
    this.getVideoDevices().then(devices => {
      if (devices.length > 0) {
        this.cameraErrorMessage = error;
        this.toastService.error('camera.modal.toast.error.message', 'camera.modal.toast.title');
        console.log(error);
      } else {
        this.translate.get('camera.modal.no.device').subscribe((translation) => {
          this.cameraErrorMessage = translation;
        });
      }
    });
  }

  selectedCameraId() {
    if (this.selectedCamera) {
      return this.selectedCamera.deviceId;
    }
    return null;
  }

  private initVideoDevices() {
    this.getVideoDevices().then(devices => {
      this.cameras = devices;
      if (!this.selectedCamera && this.cameras.length > 0) {
         this.selectedCamera = this.cameras[0];
      }
    });
  }

  private getVideoDevices(): Promise<MediaDeviceInfo[]> {
    return this.mediaDevices.loadDevices().then((devices: MediaDeviceInfo[]) => {
      return devices.filter(device => device.kind === 'videoinput');
    });
  }
}
