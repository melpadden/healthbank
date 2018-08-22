import {Component, OnInit, ViewChild, ViewContainerRef} from '@angular/core';
import { MediplanService } from '../services/mediplan.service';
import { FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms';
import {QrScannerComponent} from '../../shared/qr/qr-scanner.component';
import {QrService} from '../../shared/qr/qr.service';
import {Log} from '../../shared/log';
import * as jsPDF from 'jspdf';
import * as $ from 'jquery';
import {PdfViewerComponent} from 'ng2-pdf-viewer';
import {Metadata} from '../models/metadata';
import {DownloadDataComponent} from '../../shared/components/download/download-data.component';
import * as QRious from 'qrious';
import {SafeResourceUrl, DomSanitizer} from '@angular/platform-browser';
import {ModalDialogModule, ModalDialogService} from 'ngx-modal-dialog';

@Component({
  selector: 'app-load-mediplan',
  templateUrl: './load-mediplan-page-component.html',
  styleUrls: [ './load-mediplan-page.component.scss' ]
})
export class LoadMediplanPageComponent implements OnInit {
  createItemForm: FormGroup;
  files: Array<any> = [];
  resetDrop: boolean;

  @ViewChild('qrScanner')
  scanner: QrScannerComponent;

  @ViewChild('qrThumbnail')
  qrThumbnail: HTMLImageElement;

  @ViewChild('overlay')
  overlay: HTMLDivElement;

  @ViewChild('pdfViewer')
  pdfViewer: PdfViewerComponent;

  /*
    This region is for form data to be used directly in the UI.
   */
  qrResultString: string;

  thumbnailCreated: boolean;
  thumbnailUrl: string;
  pdfSrc: string;
  pdfData: Blob;
  pdfThumbnail: Blob;
  filename: string;
  page:number = 1;
  pageUrl: SafeResourceUrl;
  pdfShow: boolean;

  metadata : Metadata;

  constructor(
    private mediplanService: MediplanService,
    private qrService: QrService,
    private fb: FormBuilder,
    private domSanitizer: DomSanitizer,
    private modalService: ModalDialogService,
    private viewRef: ViewContainerRef) {
    this.initFormDescription();
  }

  ngOnInit() {
    this.scanner.QrReadSuccess.subscribe((qrCode) => this.handleQrReadSuccess(qrCode));
  }

  /**
   *
   */
  handleQrReadSuccess(qrCode: string){
    Log.Debug('LoadMediplanPageComponent.handleQrReadSuccess, qrCode is: ', qrCode);
    this.getPdf(qrCode);
    this.getMetadata(qrCode);
    Log.Debug(this.overlay);
  }

  getPdf(qrCode: string){
    this.mediplanService.getPdf(qrCode).subscribe(
      res => {
        try {
          Log.Debug(res);
          // Put the object into storage
          const storageKey = 'qrcode_pdf';
          localStorage.setItem(storageKey, JSON.stringify(res));
          // Retrieve the object from storage
          var retrievedObject = localStorage.getItem(storageKey);
          console.log('retrievedObject: ', JSON.parse(retrievedObject));
          const blob = new Blob([res], {type: 'application/pdf'});
          Log.Debug(blob);
          const fileURL = URL.createObjectURL(blob);
          this.pdfData  = blob;
          this.pdfSrc   = fileURL;
          this.pageUrl  = this.domSanitizer.bypassSecurityTrustResourceUrl(this.pdfSrc);
        }
        catch(err){
          Log.Error(err);
        }
      },
      err => {
        Log.Error(err);
      }
    );
  }

  thumbnailCreate(qrCode: string){
    const doc: jsPDF = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'A4'
    });
    const imageOffsetQR = (doc.internal.pageSize.getWidth() - 100 * 0.9) / 2;
    Log.Debug('Adding image to PDF');
    const qr = new QRious({
      value: qrCode,
      padding: 0,
      size: 512,
      level: 'L'
    });
    Log.Debug(qr);
    var url = qr.toDataUrl();
    doc.addImage(url, 'PNG', imageOffsetQR, 15, 100, 100);
    Log.Debug(doc);
    this.pdfThumbnail = doc.output('blob');
  }
  getMetadata(qrCode: string){
    this.mediplanService.getMetadata(qrCode).subscribe(
      res => {
        Log.Debug(res);
        this.metadata = res;
      },
      err => {
        Log.Error(err);
      }
    );
  }


/*
  convertToThumbnail(pdf: Blob) : string {
    let sourcePath = 'data:image/png;base64,';
    var doc = new jsPDF();
    doc.addIm
    var b64 = btoa(pdf);
    Log.Debug('b64: ' + b64);
    sourcePath = sourcePath + b64;
    return sourcePath;
  }
*/

  initFormDescription() {
    this.createItemForm = this.fb.group(
      {
        title: new FormControl('', [Validators.required]),
        creationDate: new FormControl('', [Validators.required]),
        tags: [''],
        location: [''],
      });
  }

  reset() {
    this.resetDrop = true;
    this.createItemForm.reset();
    this.files = [];
  }

  getFilesLength(): number {
    return Object.keys(this.files).length;
  }

  loadDummyQrCode() {
    const qrCode = 'CHMED16A1H4sIAAAAAAAAC7VTwW7CMAz9l1zXojiQAr2NVSAk2BBjO2zi0LURraApStNJDPXPuPFjcxrKdkCamLZDpdf3HPvZsvdkFupUSE38PRneh5kgPglyFRKHTE6/IxW+CYXEIMAwAv0OdwFc1kZqJGSMms8c8qiVECYA6Zd0a8FdqncWTeQKQSwQzpJcmsQIpyI2lYNJoadCWm4eEf91T8aodCrHAtYAaEC7ARxf4AMP+LKhPEvxLiyrpSkSFnXKxW6LdcEhz+EGa/VNB08y1af8VmaNDB4/61Atq6q2m0Y4FaltQlOM8H6PU4wcxzZBBzvMrR7oocozjGEUui7lLmUYGKAGLerQr6/2aUvhINcYtFiv5oWZyGBT6iSPkliVkRHmeYjs7IE03RIA5nU7/LcW4GcLYRklxVakUSI2sToeCnHZCO0B53CtEdrifziLHvf69P9m8RglmVAfuKyXyrcZh6v7v24X3oWKjwcpSzyo7xbw0QzNicwQ9rTO+157Q+4Wx2dRfcpnJ70FMJ9Sn8INNcAkztY2Eo9hUN9w9QnaarPCLQQAAA==';
    this.handleQrReadSuccess(qrCode);
  }

  showPdf(){
    this.pdfShow = true;

    this.modalService.openDialog(
      this.viewRef, {
        title: "View Pdf",
        childComponent: this.overlay
      });

  }

  keyPressHandler(e) {
    Log.Debug('keyPressHandler, e:', e);
    var kC  = (window.event) ? event.keyCode : e.keyCode;
    var Esc = (window.event) ? 27 : e.DOM_VK_ESCAPE;
    if(kC==Esc) {
      document.getElementByClassName('overlay').style.display = 'none';
    }
  }

  clickOverlay() {
    Log.Debug('clickOverlay');
    this.pdfShow = false;
  }
}
