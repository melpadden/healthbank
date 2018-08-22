import {inject, TestBed} from '@angular/core/testing';
import {HttpErrorService, trimStack} from './http-error.service';
import {HttpErrorResponse, HttpRequest} from '@angular/common/http';
import {RestError} from './rest-error.model';
import {DateTime} from '../date/date.type';
import {NgbModal, NgbModalRef, NgbModule} from '@ng-bootstrap/ng-bootstrap';
import {CommonModule} from '@angular/common';
import {TechnicalErrorComponent} from './technical-error/technical-error.component';
import {BrowserDynamicTestingModule} from '@angular/platform-browser-dynamic/testing';
import {RouterTestingModule} from '@angular/router/testing';
import {SharedModule} from '../shared.module';

describe('HttpErrorService ', () => {
  let responseData: RestError;
  let request: HttpRequest<any>;
  let modalResp: NgbModalRef;
  let modalSrvc: NgbModal;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        CommonModule,
        SharedModule,
        NgbModule.forRoot(),
        RouterTestingModule,
      ],
      providers: [],
      declarations: [],
    });
    TestBed.overrideModule(BrowserDynamicTestingModule, {
      set: {
        entryComponents: [TechnicalErrorComponent]
      }
    });

    modalSrvc = TestBed.get(NgbModal);
    modalResp = {componentInstance: {}} as NgbModalRef;
    spyOn(modalSrvc, 'open').and.returnValue(modalResp);

    responseData = {
      error: 'something__not_found',
      message: 'Human readable error message',
      timestamp: '2015-02-01T06:07:08Z' as DateTime,
      uuid: 'uuid-value',
      stacktrace: 'Exception at stacktrace'
    };
    request = new HttpRequest<any>('POST', '/api/unit/test', {request: 'something'});
  });

  it('should display error overlay for technical errors', inject([HttpErrorService], (errSrvc: HttpErrorService) => {
    const rejection = new HttpErrorResponse({
      error: responseData,
      status: 500
    });
    errSrvc.processResponseError(rejection, request);

    expect(modalSrvc.open).toHaveBeenCalledWith(TechnicalErrorComponent, {
      backdrop: 'static',
      size: 'lg',
      windowClass: 'error',
    });
    expect(modalResp.componentInstance.rejection).toBe(rejection);
    expect(modalResp.componentInstance.request).toBe(request);
  }));

  it('should display error overlay for JSON parse errors', inject([HttpErrorService], (errSrvc: HttpErrorService) => {
    const rejection = new HttpErrorResponse({
      error: responseData,
      status: 422
    });
    errSrvc.processResponseError(rejection, request);

    expect(modalSrvc.open).toHaveBeenCalled();
  }));

  it('should not display an error overlay for non technical error', inject([HttpErrorService], (errSrvc: HttpErrorService) => {
    const rejection = new HttpErrorResponse({
      error: responseData,
      status: 400
    });
    errSrvc.processResponseError(rejection, request);

    expect(modalSrvc.open).not.toHaveBeenCalled();
  }));

  describe('stacktrace optimizer', function () {
    it('should not modify the stack trace property', function () {
      const originalStacktrace: string = 'javax.ws.rs.NotAuthorizedException: HTTP 401 Unauthorized\n' +
        '\tat com.rise.blueprint.user.impl.AuthResourceImpl.login(AuthResourceImpl.java:82)\n' +
        '\tat sun.reflect.GeneratedMethodAccessor194.invoke(Unknown Source)\n' +
        '\tat sun.reflect.DelegatingMethodAccessorImpl.invoke(DelegatingMethodAccessorImpl.java:43)';
      const error: RestError = {
        error: '',
        timestamp: '2016-06-14T15:42:57.764Z' as DateTime,
        uuid: 'RLVF JH83 JNHH UAXQ',
        stacktrace: originalStacktrace
      };

      trimStack(error);

      expect(error.stacktrace).toBe(originalStacktrace);
    });

    it('should work without stacktrace property', function () {
      expect(() => {
        const error: RestError = {
          error: '',
          timestamp: '2016-06-14T15:42:57.764Z' as DateTime,
          uuid: 'RLVF JH83 JNHH UAXQ'
        };

        expect(trimStack(error)).toContain('2016-06-14');
      }).not.toThrow();
    });

    it('should have real new lines and tabs, not escaped ones', function () {
      const originalStacktrace: string = 'javax.ws.rs.NotAuthorizedException: HTTP 401 Unauthorized\n' +
        '\tat com.rise.blueprint.user.impl.AuthResourceImpl.login(AuthResourceImpl.java:82)\n' +
        '\tat sun.reflect.GeneratedMethodAccessor194.invoke(Unknown Source)\n' +
        '\tat sun.reflect.DelegatingMethodAccessorImpl.invoke(DelegatingMethodAccessorImpl.java:43)';
      const error: RestError = {
        error: '',
        timestamp: '2016-06-14T15:42:57.764Z' as DateTime,
        uuid: 'RLVF JH83 JNHH UAXQ',
        stacktrace: originalStacktrace
      };

      const result: string = trimStack(error);

      expect(result).not.toContain('\\n');
      expect(result).not.toContain('\\t');
    });

    it('should limit stack traces to exception message and next location line', function () {
      const skippingPart: string = '\tat sun.reflect.GeneratedMethodAccessor194.invoke(Unknown Source)\n' +
        '\tat sun.reflect.DelegatingMethodAccessorImpl.invoke(DelegatingMethodAccessorImpl.java:43)';
      const originalStacktrace: string = 'javax.ws.rs.NotAuthorizedException: HTTP 401 Unauthorized\n' +
        '\tat com.rise.blueprint.user.impl.AuthResourceImpl.login(AuthResourceImpl.java:82)\n' +
        skippingPart;
      const error: RestError = {
        error: '',
        timestamp: '2016-06-14T15:42:57.764Z' as DateTime,
        uuid: 'RLVF JH83 JNHH UAXQ',
        stacktrace: originalStacktrace
      };

      const result: string = trimStack(error);

      expect(result).toContain('javax.ws.rs.NotAuthorizedException');
      expect(result).toContain('\tat com.rise.blueprint.user.impl.AuthResourceImpl.login(AuthResourceImpl.java:82)');
      expect(result).not.toContain(skippingPart);
    });

    it('should also display nested exceptions', function () {
      const skippingPart1: string = '\tat sun.reflect.GeneratedMethodAccessor194.invoke(Unknown Source)\n' +
        '\tat sun.reflect.DelegatingMethodAccessorImpl.invoke(DelegatingMethodAccessorImpl.java:43)\n';
      const skippingPart2 = '\tat com.example.TraceTest.doSomething(TraceTest.java:11)';
      const originalStacktrace: string = 'javax.ws.rs.NotAuthorizedException: HTTP 401 Unauthorized\n' +
        '\tat com.rise.blueprint.user.impl.AuthResourceImpl.login(AuthResourceImpl.java:82)\n' +
        skippingPart1 +
        'Caused by: java.lang.RuntimeException: Exception thrown\n' +
        '\tat com.example.TraceTest.throwAnException(TraceTest.java:18)\n' +
        skippingPart2;
      const error: RestError = {
        error: '',
        timestamp: '2016-06-14T15:42:57.764Z' as DateTime,
        uuid: 'RLVF JH83 JNHH UAXQ',
        stacktrace: originalStacktrace
      };

      const result: string = trimStack(error);

      expect(result).toContain('javax.ws.rs.NotAuthorizedException');
      expect(result).toContain('\tat com.rise.blueprint.user.impl.AuthResourceImpl.login(AuthResourceImpl.java:82)');
      expect(result).toContain('Caused by: java.lang.RuntimeException: Exception thrown');
      expect(result).toContain('\tat com.example.TraceTest.throwAnException(TraceTest.java:18)');
      expect(result).not.toContain(skippingPart1);
      expect(result).not.toContain(skippingPart2);
    });

    it('should not include "... 2 more" and alike', function () {
      const originalStacktrace: string = 'javax.ws.rs.NotAuthorizedException: HTTP 401 Unauthorized\n' +
        '\tat com.rise.blueprint.user.impl.AuthResourceImpl.login(AuthResourceImpl.java:82)\n' +
        '\tat sun.reflect.GeneratedMethodAccessor194.invoke(Unknown Source)\n' +
        '\tat sun.reflect.DelegatingMethodAccessorImpl.invoke(DelegatingMethodAccessorImpl.java:43)\n' +
        '\t... 2 more';
      const error: RestError = {
        error: '',
        timestamp: '2016-06-14T15:42:57.764Z' as DateTime,
        uuid: 'RLVF JH83 JNHH UAXQ',
        stacktrace: originalStacktrace
      };

      const result: string = trimStack(error);

      expect(result).not.toContain('... 2 more');
    });
  });
});


export class MockHttpErrorService extends HttpErrorService {
  constructor() {
    super(null, null, null, null, null);
  }

  processResponseError(rejection: HttpErrorResponse, request: HttpRequest<any>): void {
  }
}
