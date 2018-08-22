import {Injectable} from '@angular/core';
import * as jsPDF from 'jspdf';
import * as QRious from 'qrious';
import {BrowserQRCodeReader} from '@zxing/library';

@Injectable()
export class QrService {

  constructor() {
  }

  /**
   * Creates a {Blob} containing a pdf with a qr code and text with the passed name.
   *
   * This could be used with 'file-saver' like this
   * <pre>
   * saveAs(this.qrService.createUserExportPdf('...','Max Musterman'), 'out.pdf');
   * </pre>
   *
   * @param {String} qrContent  the value the qr will display
   * @param {String} userName  name of the user (e.g. 'Max Mustermann')
   * @returns {Blob} containing the raw pdf data with type 'application/pdf'
   */
  createUserExportPdf(qrContent: string, userName: string): Blob {
    const doc: jsPDF = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'A4'
    });

    const text = 'Healthbank Private Key: ' + userName;
    const textWidth = doc.getStringUnitWidth(text) * doc.internal.getFontSize() / doc.internal.scaleFactor;
    const textOffset = (doc.internal.pageSize.getWidth() - textWidth) / 2;
    const imageOffsetQR = (doc.internal.pageSize.getWidth() - 100 * 0.9) / 2;
    doc.addImage(QrService.createQR(qrContent), 'PNG', imageOffsetQR, 15, 100, 100);
    doc.text(text, textOffset, 120);
    return doc.output('blob');
  }

  /**
   * Creates a {Blob} containing a pdf with a qr code and text with the passed name.
   *
   * This could be used with 'file-saver' like this
   * <pre>
   * saveAs(this.qrService.createUserExportPdf('...','Max Musterman'), 'out.pdf');
   * </pre>
   *
   * @param {String} qrContent  the value the qr will display
   * @returns {Blob} containing the raw pdf data with type 'application/pdf'
   */
  createPdfImage(qrContent: string): Blob {
    const doc: jsPDF = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'A4'
    });

    const imageOffsetQR = (doc.internal.pageSize.getWidth() - 100 * 0.9) / 2;
    doc.addImage(QrService.createQR(qrContent), 'PNG', imageOffsetQR, 15, 100, 100);
    return doc.output('blob');
  }

  /**
   * Creates a {Blob} containing a pdf with a qr code and text with the passed name.
   *
   * This could be used with 'file-saver' like this
   * <pre>
   * saveAs(this.qrService.createUserExportPdf('...','Max Musterman'), 'out.pdf');
   * </pre>
   *
   * @param {String} qrContent  the value the qr will display
   * @returns {Blob} containing the raw pdf data with type 'application/pdf'
   */
  createPngImage(pdf: Blob): string {

    const doc: jsPDF = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'A4'
    });

    const imageOffsetQR = (doc.internal.pageSize.getWidth() - 100 * 0.9) / 2;
    var encoded = 'data:image/jpeg;base64,' + btoa.apply(pdf);
    return encoded;
    //doc.addImage(encoded, 'PNG', imageOffsetQR, 15, 100, 100);
    //return doc.output('blob');
  }


  decodeQr(file: File): Promise<any> {
    const codeReader = new BrowserQRCodeReader();
    const url = URL.createObjectURL(file);
    return new Promise((resolve, reject) => {
      setTimeout(() => {
          codeReader.reset();
          reject('Decode not possible within timeout');
        }, 5000
      );
      codeReader.decodeFromImage(undefined, url)
        .then(value => {
          resolve(value);
        })
        .catch(reason => {
          URL.revokeObjectURL(url);
          reject(reason);
        });
    });
  }

  /**
   * Will use https://github.com/neocotic/qrious for QR generation.
   *
   * @param {String} content to create a
   * @returns {String} toDataURL string
   */
  private static createQR(content: string): string {
    const qr = new QRious({
      value: content,
      padding: 0,
      size: 512,
      level: 'L'
    });
    return qr.toDataURL();
  }
}
