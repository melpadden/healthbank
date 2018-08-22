import {Component, EventEmitter, Input, OnInit, Output, ViewChild} from '@angular/core';
import {SessionUser} from '../user/user-session';
import {FormGroup} from '@angular/forms';
import {environment} from '../../../environments/environment';
import {Params} from '@angular/router';
import {ZXingScannerComponent, ZXingScannerModule} from '@zxing/ngx-scanner';
import {BrowserQRCodeReader, VideoInputDevice, Result } from '@zxing/library';
import {QrService} from './qr.service';
import {Log} from '../log';

@Component({
  selector: 'app-qr-scanner',
  templateUrl: './qr-scanner.component.html',
  styleUrls: ['qr-scanner.component.scss']
})

export class QrScannerComponent implements OnInit {
  @Output() QrReadSuccess: EventEmitter<any> = new EventEmitter<string>();

  @ViewChild('qrReader')
  codeReader: BrowserQRCodeReader;

  @ViewChild('qrScanner')
  scanner: ZXingScannerComponent;

  @ViewChild('startButton')
  startButton: HTMLButtonElement;

  hasDevices: boolean;
  hasPermission: boolean;
  qrResultString: string;
  qrResult: Result;

  availableDevices: MediaDeviceInfo[];
  multipleDevices: boolean;
  currentDevice: MediaDeviceInfo;
  qrCodeUploaded: boolean;

  qrCodeImage: Blob;


  constructor(private qrService: QrService) {

  }

  ngOnInit() {
    this.subscribeAll();
  }

  subscribeAll() {
    this.scanner.camerasFound.subscribe((devices: MediaDeviceInfo[]) => this.onCamerasFound(devices));
    this.scanner.camerasNotFound.subscribe(() => this.onCamerasNotFound());
    this.scanner.scanComplete.subscribe((result: Result) => this.onScanComplete(result));
    this.scanner.scanError.subscribe((error: Error) => this.onScanError(error));
    this.scanner.scanFailure.subscribe(() => this.onScanFailure());
    this.scanner.scanError.subscribe((error: Error) => this.onScanError(error));
    this.scanner.permissionResponse.subscribe((perm: boolean) => this.onPermissionResponse(perm));
  }

  unSubscribeAll() {
    this.scanner.camerasFound.unsubscribe();
    this.scanner.camerasNotFound.subscribe();
    this.scanner.scanComplete.subscribe();
    this.scanner.scanError.subscribe();
    this.scanner.scanFailure.subscribe();
    this.scanner.scanError.subscribe();
    this.scanner.permissionResponse.subscribe();
  }

  displayCameras(cameras: MediaDeviceInfo[]) {
    this.availableDevices = cameras;
  }

  handleQrCodeResult(resultString: string) {
    this.qrResultString = resultString;
  }

  onDeviceSelectChange(selectedValue: string) {
    Log.Debug('Selection changed: ', selectedValue);
    this.currentDevice = this.scanner.getDeviceById(selectedValue);
    this.scanner.scan(selectedValue);
  }

  onCamerasFound(devices: MediaDeviceInfo[]) {
    this.hasDevices = (devices.length > 0);
    this.multipleDevices = (devices.length > 1);
    this.availableDevices = devices;
    if (this.availableDevices.length == 1) {
      this.currentDevice = this.availableDevices[0];
      this.scanner.scan(this.currentDevice.deviceId);
    }
  }

  onCamerasNotFound() {
    this.hasDevices = false;
    this.currentDevice = null;
  }

  onScanComplete(result: Result) {
    this.qrResult = result;
    this.qrResultString = result.getText();
    /*
    let imageData = this.qrService.createPdfImage(this.qrResult.getText());
    this.qrCodeImage = imageData;
    this.qrCodeUploaded = true;
     */
    this.QrReadSuccess.emit(this.qrResultString);
  }

  onScanError(error: Error) {
    Log.Debug('Error: ' + error.message);
  }

  onScanFailure() {
    Log.Debug('Scan Failed: ');
  }

  onPermissionResponse(perm: boolean) {
    Log.Debug('Permissions Response: ' + perm);
    this.hasPermission = perm;
  }

  onStartClick(event: Event) {
    Log.Debug('onStartClick');
    this.scanner.scan(this.currentDevice.deviceId);
  }
  onResetClick(event: Event) {
    // this.scanner.scan(this.currentDevice.deviceId);
  }
}
