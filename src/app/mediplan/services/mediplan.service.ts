import {Inject, Injectable} from '@angular/core';
import { Observable } from 'rxjs/Observable';
import 'rxjs/Observable';
import {HttpClient, HttpEvent, HttpHeaders, HttpResponse} from '@angular/common/http';
import {ENV_SETTINGS_TOKEN, EnvSettings} from '../../settings-loader';
import {Metadata} from '../models/metadata';
import {Log} from '../../shared/log';

/**
 * Mediplan Service.
 */
@Injectable()
export class MediplanService {

  constructor(
    private httpClient: HttpClient,
    @Inject(ENV_SETTINGS_TOKEN) private envSettings: EnvSettings) {
  }

  getPdf(qrCode: string): Observable<Blob> {
    const qrConvertApiUrl = this.envSettings.qrConvertApiHost;
    let httpBody = {
      'medication': qrCode,
      'organization': this.envSettings.organization
    };

    const headers = new HttpHeaders()
      .append('Content-Type',  'application/json')
      .append('authority', this.envSettings.authority || 'blank')
      .append('accept-language', this.envSettings.acceptLanguage || 'blank')
      .append('Accept', 'application/pdf' || 'blank')
      .append('hci-customerid', this.envSettings.hciCustomerId || 'blank')
      .append('hci-index', this.envSettings.hciIndex || 'blank')
      .append('hci-software', this.envSettings.hciSoftware || 'blank')
      .append('hci-softwareorg', this.envSettings.hciSoftwareOrg || 'blank')
      .append('hci-softwareorgid', this.envSettings.hciSoftwareOrgId || 'blank')
    ;

    return this.httpClient.post(qrConvertApiUrl, httpBody,{ headers: headers, responseType: 'blob' });
  }

  getMetadata(qrCode: string): Observable<Metadata>{
    const qrConvertApiUrl = this.envSettings.qrMetadataApiHost;
    // "qrMetadataApiHost": "https://galenicawrapper.azurewebsites.net/",
    // "qrMetadataApiHost": "https://int.documedis.hcisolutions.ch/api/converters/resolveChmed",
    // const qrConvertApiUrl = "https://galenicawrapper.azurewebsites.net/Metadata";
    const httpBody = qrCode;
    const headers = new HttpHeaders()
/*
      .append('Content-Type',  'text/plain')
      .append('authority', this.envSettings.authority || 'blank')
      .append('accept-language', this.envSettings.acceptLanguage || 'blank')
      .append('Accept', 'application/pdf' || 'blank')
      .append('hci-customerid', this.envSettings.hciCustomerId || 'blank')
      .append('hci-index', this.envSettings.hciIndex || 'blank')
      .append('hci-software', this.envSettings.hciSoftware || 'blank')
      .append('hci-softwareorg', this.envSettings.hciSoftwareOrg || 'blank')
      .append('hci-softwareorgid', this.envSettings.hciSoftwareOrgId || 'blank')*/
    ;

    // const options = { headers: headers, responseType: 'json' };
    return this.httpClient.post<Metadata>(qrConvertApiUrl, httpBody, { headers: headers, responseType: 'json' });
  }
}
