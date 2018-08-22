import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { HttpErrorResponse, HttpRequest } from '@angular/common/http';
import { RestError } from '../rest-error.model';
import { environment } from '../../../../environments/environment';
import { VersionService } from '../../version/version.service';
import { DEFAULT_TECHNICAL_ERROR_MSG } from '../error-msgs';

@Component({
  selector: 'app-technical-error',
  templateUrl: './technical-error.component.html',
  styleUrls: ['./technical-error.component.scss']
})
export class TechnicalErrorComponent implements OnInit, OnChanges {
  @Input() rejection: HttpErrorResponse;
  @Input() request: HttpRequest<any>;

  public assets = environment.assets;
  public data: RestError;
  public jti: string;
  public unfolded = false;
  private timeStamp: string;
  private jsonParseFail = false;

  constructor(public activeModal: NgbActiveModal, private versionService: VersionService) { }

  ngOnInit() {
    this.timeStamp = new Date().toISOString() + ' (U)';
    this.ngOnChanges({});
  }

  ngOnChanges(changes: SimpleChanges) {
    this.data = {} as RestError;

    if (this.rejection) {
      try {
        this.jsonParseFail = false;
        this.data = this.rejection.error;
        this.unfolded = this.isDebug() || !this.data.uuid;
      } catch (e) {
        this.data = {} as RestError;
        this.jsonParseFail = true;
      }
    }
  }

  close() {
    this.activeModal.dismiss();
  }

  getHttpMethod(): string {
    return this.request && this.request.method;
  }

  getHttpUrl(): string {
    return this.request && this.request.url;
  }

  getHumanMessage(): string {
    const reqMessage = this.data && this.data.message;

    return reqMessage || DEFAULT_TECHNICAL_ERROR_MSG;
  }

  getRequestBody(): string {
    if (!this.request || !this.request.body) {
      return '';
    }
    const request = this.request.body;
    const masked = this.maskPasswordFields(request);
    return JSON.stringify(masked, null, 2).trim();
  }

  getStackOrBody(): string {
    if (this.data.stacktrace) {
      return this.data.stacktrace;
    }

    if (this.jsonParseFail && this.rejection.error) {
      return this.rejection.error;
    }

    return '';
  }

  getTimestamp(): string {
    return this.data.timestamp || this.timeStamp;
  }

  getVersion(): string {
    return this.versionService.getFormattedFull();
  }

  isDebug(): boolean {
    return !!this.data.stacktrace;
  }

  maskPasswordFields(obj: {[index: string]: any}): Object {
    for (const key of Object.keys(obj)) {
      const val = obj[key];

      if (val && typeof val === 'object') {
        obj[key] = this.maskPasswordFields(val);
      } else if (typeof val === 'string' && val !== '') {
        if (key.toLowerCase() === 'password') {
          obj[key] = '***';
        }
      }
    }

    return obj;
  }
}
