import { fakeAsync, TestBed } from '@angular/core/testing';
import { RequestAuthInterceptor } from './request-auth.interceptor';
import { APP_AUTH_CONFIG } from '../auth/auth.config';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { HTTP_INTERCEPTORS, HttpClient } from '@angular/common/http';


describe('RequestAuthInterceptor', () => {
  let http: HttpClient;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [{
        provide: HTTP_INTERCEPTORS,
        useClass: RequestAuthInterceptor,
        multi: true
      }]
    });

    http = TestBed.get(HttpClient);
    httpMock = TestBed.get(HttpTestingController);
  });

  describe('JWT token', () => {
    beforeEach(() => {
      window.sessionStorage.setItem(APP_AUTH_CONFIG.tokenName, 'mock.JWT.token');
    });

    afterEach(() => {
      window.sessionStorage.clear();
    });

    it('should be added to `/api` requests', fakeAsync(() => {
      http.head('/api/resource').subscribe(r => expect(r).toBeTruthy());
      expect(httpMock.expectOne('/api/resource').request.headers.has(APP_AUTH_CONFIG.authHeaderName))
        .toBe(true, 'request method should include the JWT header');

      http.get('/api/resource').subscribe(r => expect(r).toBeTruthy());
      expect(httpMock.expectOne('/api/resource').request.headers.has(APP_AUTH_CONFIG.authHeaderName))
        .toBe(true, 'GET should include the JWT header');

      http.post('/api/resource', {}).subscribe(r => expect(r).toBeTruthy());
      expect(httpMock.expectOne('/api/resource').request.headers.has(APP_AUTH_CONFIG.authHeaderName))
        .toBe(true, 'POST should include the JWT header');

      http.put('/api/resource', {}).subscribe(r => expect(r).toBeTruthy());
      expect(httpMock.expectOne('/api/resource').request.headers.has(APP_AUTH_CONFIG.authHeaderName))
        .toBe(true, 'PUT should include the JWT header');

      httpMock.verify();
    }));

    it('should also be added on other request (`/other`)', fakeAsync(() => {
      http.get('/other/resource').subscribe(r => expect(r).toBeTruthy());
      expect(httpMock.expectOne('/other/resource').request.headers.has(APP_AUTH_CONFIG.authHeaderName))
        .toBe(true, 'GET should NOT include the JWT header');

      http.post('/other/resource', {}).subscribe(r => expect(r).toBeTruthy());
      expect(httpMock.expectOne('/other/resource').request.headers.has(APP_AUTH_CONFIG.authHeaderName))
        .toBe(true, 'POST should NOT include the JWT header');

      http.put('/other/resource', {}).subscribe(r => expect(r).toBeTruthy());
      expect(httpMock.expectOne('/other/resource').request.headers.has(APP_AUTH_CONFIG.authHeaderName))
        .toBe(true, 'GET should NOT include the JWT header');

      httpMock.verify();
    }));

    xit('should not be added on requests to other domains (`http..`)', fakeAsync(() => {
      http.get('http://www.external.domain.org/api').subscribe(r => expect(r).toBeTruthy());
      expect(httpMock.expectOne('http://www.external.domain.org/api').request.headers.has(APP_AUTH_CONFIG.authHeaderName))
        .toBe(false, 'GET should NOT include the JWT header');

      http.post('https://www.external.domain.org/api', {}).subscribe(r => expect(r).toBeTruthy());
      expect(httpMock.expectOne('https://www.external.domain.org/api').request.headers.has(APP_AUTH_CONFIG.authHeaderName))
        .toBe(false, 'POST should NOT include the JWT header');

      http.put('http://www.external.domain.org/api', {}).subscribe(r => expect(r).toBeTruthy());
      expect(httpMock.expectOne('http://www.external.domain.org/api').request.headers.has(APP_AUTH_CONFIG.authHeaderName))
        .toBe(false, 'GET should NOT include the JWT header');

      httpMock.verify();
    }));
  });

  describe('empty string replacement', () => {
    it('should be triggered on JSON data and make a deep copy', fakeAsync(() => {
      const origBody = {nested: {emptyField: ''}};
      http.post('/api/resource', origBody).subscribe(r => expect(r).toBeTruthy());
      expect(httpMock.expectOne('/api/resource').request.body.nested.emptyField)
        .toBe(null);
      expect(origBody.nested.emptyField).toBe('');

      httpMock.verify();
    }));

    it('should work with empty bodies and arrays', fakeAsync(() => {
      http.put('/api/resource', undefined).subscribe(r => expect(r).toBeTruthy());
      expect(httpMock.expectOne('/api/resource').request.body)
        .toEqual(null, 'omitted body should equal undefined');

      http.post('/api/resource', {}).subscribe(r => expect(r).toBeTruthy());
      expect(httpMock.expectOne('/api/resource').request.body)
        .toEqual({}, 'empty object should equal object');

      http.post('/api/resource', []).subscribe(r => expect(r).toBeTruthy());
      expect(httpMock.expectOne('/api/resource').request.body)
        .toEqual([], 'empty array via request should equal array');

      http.put('/api/resource', []).subscribe(r => expect(r).toBeTruthy());
      expect(httpMock.expectOne('/api/resource').request.body)
        .toEqual([], 'PUT with empty array should equal array');

      httpMock.verify();
    }));

    it('should not interfere with text and blob bodies', fakeAsync(() => {
      const blob = new Blob(['{"f": ""}'], {type: 'plain/text;charset=UTF-8'});

      http.post('/api/resource', '{"f": ""}').subscribe(r => expect(r).toBeTruthy());
      expect(httpMock.expectOne('/api/resource').request.body)
        .toEqual('{"f": ""}', 'POST should not change text body although it looks like JSON');

      http.post('/api/resource', blob).subscribe(r => expect(r).toBeTruthy());

      const reader = new FileReader();
      reader.addEventListener('load', function(e: Event) {
          expect(reader.result).toEqual('{"f": ""}', 'POST should not touch Blob although it looks like JSON');
      });
      reader.readAsText(httpMock.expectOne('/api/resource').request.body);

      httpMock.verify();
    }));
  });
});
