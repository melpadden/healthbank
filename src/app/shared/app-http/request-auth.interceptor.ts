import { Injectable } from '@angular/core';
import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';
import { getJwtAuthHeader } from '../auth/auth-helper';
import { normalizeEmptyStrings } from './request-body-normalizer';

@Injectable()
export class RequestAuthInterceptor implements HttpInterceptor {
  static normalizeBody(req: HttpRequest<any>) {
    if (req.detectContentTypeHeader() === 'application/json') {
      return normalizeEmptyStrings(req.body);
    }

    return req.body;
  }

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const headers = getJwtAuthHeader(req);
    const body = RequestAuthInterceptor.normalizeBody(req);

    return next.handle(req.clone({headers, body}));
  }
}
