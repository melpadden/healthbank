import {Injectable} from '@angular/core';
import {HttpErrorResponse, HttpEvent, HttpRequest} from '@angular/common/http';
import {RestError, RestErrorHandleConfig} from './rest-error.model';
import {NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {TechnicalErrorComponent} from './technical-error/technical-error.component';
import {ActivatedRoute, Router} from '@angular/router';
import {APP_AUTH_CONFIG} from '../auth/auth.config';
import {LANDING_URL} from '../../app.config';
import {ToastService} from '../toast/toast.service';
import {Observable} from 'rxjs/Observable';
import {DEFAULT_BUSINESS_ERROR_MSG, DEFAULT_UNAUTHORIZED_ERROR_MSG, RESPONSE_ERROR_MESSAGES} from './error-msgs';
import * as _ from 'lodash';
import {CryptoService} from '../crypto/crypto.service';
import 'rxjs/add/operator/take';


export interface ResponseErrors {
  [index: string]: string | [string, string];
}

@Injectable()
export class HttpErrorService {

  constructor(private ngbModal: NgbModal,
              private router: Router,
              private activeRoute: ActivatedRoute,
              private toast: ToastService,
              private cryptoService: CryptoService) {
  }

  /**
   * Checks response for error and display appropriate message
   *
   * *On business errors, an error toast will be displayed*
   * The to be displayed messages depend on the error key in `data.error` and `data.details`. This mapping is defined
   * in the injectable object `responseErrorMessages`. Two types of messages are accepted:
   * * string: contains only the main message
   * * [string, string]: first argument is the title, second the main message
   *
   * If no message is defined or the data of the error response is empty, a default error message
   * is displayed (defined in `DEFAULT_BUSINESS_ERROR_MSG`)
   *
   * For each error key an own error toast will be displayed
   *
   * If no error message should be displayed, add the `noErrorMsg` config flag to the `$http` call.
   *
   * *On network issues, a error toast will be displayed*
   * Issues with the network result in an error code of -1 (consult angular docs). In this case
   * a specific error message is shown, with no more action.
   *
   * *if non of the above matches, a technical error is assumed*
   * In this case a layover with details of the error will be displayed
   */
  processResponseError(rejection: HttpErrorResponse, request: HttpRequest<any>): void {
    if (rejection.status === 401) {
      this.cryptoService.clearKeystore();
      if (window.sessionStorage.getItem(APP_AUTH_CONFIG.tokenName)) {
        window.sessionStorage.removeItem(APP_AUTH_CONFIG.tokenName);
        this.activeRoute.queryParams.take(1).subscribe(value => {
          this.router.navigate([LANDING_URL],
            {queryParams: _.extend({}, value, {redirect: this.router.url.split('?')[0]})});
        });
        this.toast.error(DEFAULT_UNAUTHORIZED_ERROR_MSG.message, DEFAULT_UNAUTHORIZED_ERROR_MSG.title, false);
      }
    } else if (rejection.status >= 400 && rejection.status < 500 && rejection.status !== 422) {
      let jsonResponse = true;

      try {
        console.log(`Got HTTP ${rejection.status} response: ${trimStack(rejection.error)}`);
      } catch (e) {
        if (e instanceof SyntaxError) {
          // json parse failed
          jsonResponse = false;
        }
        console.log(`Got HTTP ${rejection.status} response: ${rejection.error}`);
      }

      // show errors toasts
    } else if (rejection.status !== 0) {
      console.warn(`System error: HTTP ${rejection.message} response: ${rejection.error}`);

      this.showErrorOverlay(rejection, request);
    } else {
      console.warn('client is offline');
    }
  }

  processErrorToast(rejection: HttpErrorResponse, errorConfig?: RestErrorHandleConfig): Observable<HttpEvent<any>> {
    if (rejection.status < 400 || rejection.status >= 500 || rejection.status === 422 || rejection.status === 401) {
      return Observable.throw(rejection);
    }
    let errorMsg: string | [string, string];
    if (rejection.error) {
      errorMsg = RESPONSE_ERROR_MESSAGES[rejection.error.error];
    } else {
      errorMsg = RESPONSE_ERROR_MESSAGES[rejection.message];
    }

    if (!errorConfig) {
      this.showDefaultMessage(rejection, errorMsg, null);
      return Observable.throw(rejection);
    }

    const errorMsgTitle: string = errorConfig.errorMsgTitle;
    if (errorConfig.overrideErrorMsg && errorConfig.overrideErrorMsg[rejection.error.error]) {
      errorMsg = errorConfig.overrideErrorMsg[rejection.error.error];
    }

    if (!errorMsg && rejection.error && rejection.error.message) {
      errorMsg = rejection.error.message;
    }

    this.showDefaultMessage(rejection, errorMsg, errorMsgTitle);
    return Observable.throw(rejection);
  }

  addResponseErrors(responseErrors: ResponseErrors) {
    _.extend(RESPONSE_ERROR_MESSAGES, responseErrors);
  }

  showDefaultMessage(rejection: HttpErrorResponse, errorMsg?: string | [string, string], errorMsgTitle?: string) {
    if (errorMsg) {
      if (typeof errorMsg === 'string') {
        this.toast.error(errorMsg, errorMsgTitle);
      } else {
        if (!errorMsgTitle) {
          errorMsgTitle = errorMsg[0];
        }
        this.toast.error(errorMsg[1], errorMsgTitle, rejection.status !== 401);
      }
    } else {
      this.toast.error(DEFAULT_BUSINESS_ERROR_MSG.message, DEFAULT_BUSINESS_ERROR_MSG.title);
    }
  }

  private showErrorOverlay(rejection: HttpErrorResponse, request: HttpRequest<any>) {
    const modalRef = this.ngbModal.open(TechnicalErrorComponent, {
      backdrop: 'static',
      size: 'lg',
      windowClass: 'error',
    });
    modalRef.componentInstance.rejection = rejection;
    modalRef.componentInstance.request = request;
  }
}

export function trimStack(rejection: RestError | null): string {
  if (!rejection) {
    return '';
  }

  const copy = {...rejection};
  if (copy.stacktrace) {
    const splitStack: string[] = copy.stacktrace.split('\n');
    const moreReg: RegExp = /\.\.\. \d+ more/;
    const cutStack: string[] = [];

    for (let i = 0; i < splitStack.length; i++) {
      if (splitStack[i].indexOf('\tat ') !== 0 && !moreReg.test(splitStack[i])) {
        cutStack.push(splitStack[i]);
        i += 1;
        cutStack.push(splitStack[i]);
      }
    }

    copy.stacktrace = cutStack.join('\n').trim();
  }

  return JSON.stringify(copy).replace(/\\t/g, '\t').replace(/\\n/g, '\n');
}
