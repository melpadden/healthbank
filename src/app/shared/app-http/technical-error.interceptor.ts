import { Injectable } from '@angular/core';
import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';
import { HttpErrorService } from './http-error.service';
import 'rxjs/add/operator/catch';
import 'rxjs/add/observable/throw';

@Injectable()
export class TechnicalErrorInterceptor implements HttpInterceptor {
  constructor(private errorService: HttpErrorService) {
  }

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(req)
      .catch(err => {
        this.errorService.processResponseError(err, req);
        return Observable.throw(err);
      });
  }
}
