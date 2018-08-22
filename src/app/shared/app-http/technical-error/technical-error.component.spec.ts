import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { HttpErrorResponse, HttpRequest } from '@angular/common/http';
import { By } from '@angular/platform-browser';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

import { TechnicalErrorComponent } from './technical-error.component';
import { DateTime } from '../../date/date.type';
import { RestError } from '../rest-error.model';
import { VersionService } from '../../version/version.service';
import { DEFAULT_TECHNICAL_ERROR_MSG } from '../error-msgs';

describe('TechnicalErrorComponent', () => {
  let closeButton: HTMLElement;
  let component: TechnicalErrorComponent;
  let content: HTMLElement;
  let fixture: ComponentFixture<TechnicalErrorComponent>;
  let responseData: RestError;
  let request: HttpRequest<any>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [TechnicalErrorComponent],
      providers: [
        {provide: NgbActiveModal, useClass: MockNgbActiveModal},
        VersionService,
      ]
    })
      .compileComponents();

    responseData = {
      error: 'something__not_found',
      message: 'Human readable error message',
      timestamp: '2015-02-01T06:07:08Z' as DateTime,
      uuid: 'uuid-value',
      stacktrace: 'Exception at stacktrace'
    };
    request = new HttpRequest<any>('POST', '/api/unit/test', {request: 'something'});
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TechnicalErrorComponent);
    component = fixture.componentInstance;
    content = fixture.debugElement.query(By.css('.modal-body')).nativeElement;
    closeButton = content.children.item(1) as HTMLElement;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display an overlay', () => {
    responseData.details = ['details_some_specific', 'details_something_minor'];
    component.rejection = new HttpErrorResponse({
      error: responseData,
      status: 500
    });
    component.request = request;
    component.ngOnChanges({});
    fixture.detectChanges();

    expect(closeButton).toBeTruthy('there should be a close button');
    expect(closeButton.tagName).toBe('BUTTON');
    expect(closeButton.classList.contains('close')).toBe(true);

    expect(content.textContent).toContain('Human readable error message');
    expect(content.textContent).toContain('uuid-value');
    expect(content.textContent).toContain('500');
    expect(content.textContent).toContain('2015-02-01T06:07:08Z');
    expect(content.textContent).toContain('/api/unit/test');
    expect(content.textContent).toContain('POST');
    expect(content.textContent).toContain('something__not_found');
    expect(content.textContent).toContain('details_some_specific');
    expect(content.textContent).toContain('details_something_minor');

    expect(content.textContent).toMatch(/\{\s*"request":\s*"something"\s*\}/);
    expect(content.textContent).toContain('Exception at stacktrace');
  });

  it('should not show the request and stacktrace in production -> if the stacktrace is not included', () => {
    responseData.stacktrace = null;
    component.rejection = new HttpErrorResponse({
      error: responseData,
      status: 500
    });
    component.request = request;
    component.ngOnChanges({});
    fixture.detectChanges();

    expect(document.getElementById('request')).toBe(null, 'should not display request body');
    expect(document.getElementById('stacktrace')).toBe(null, 'should not display stacktrace/body');
  });

  it('should handle empty rejection body', () => {
    responseData = null;
    component.rejection = new HttpErrorResponse({
      error: responseData,
      status: 500
    });
    component.request = request;
    component.ngOnChanges({});
    fixture.detectChanges();

    expect(content.textContent).toContain(DEFAULT_TECHNICAL_ERROR_MSG);
    expect(document.getElementById('stacktrace')).toBe(null, 'should not display response body');
  });

  it('should handle errors in logged out state', () => {
    component.jti = null;
    component.rejection = new HttpErrorResponse({
      error: responseData,
      status: 500
    });
    component.request = request;
    component.ngOnChanges({});
    fixture.detectChanges();
  });

  it('should mask JSON properties with the name "password"', () => {
    component.rejection = new HttpErrorResponse({
      error: responseData,
      status: 500
    });
    component.request = request.clone({
      body: {
        user: 'hugo',
        password: 'secret',
      }
    });
    component.ngOnChanges({});
    fixture.detectChanges();

    expect(content.textContent).toMatch(/\{\s*"user":\s*"hugo",\s*"password":\s*"\*\*\*"\s*\}/, 'should have masked password');
  });

  describe('mask password fields', () => {
    const componentInst = new TechnicalErrorComponent(null, null);

    it('should mask properties with name "password"', () => {
      const actual = componentInst.maskPasswordFields({user: 'hugo', password: 'secret'});
      const expected = {user: 'hugo', password: '***'};
      expect(actual).toEqual(expected);
    });

    it('should work on deep objects', () => {
      const actual = componentInst.maskPasswordFields({lvl1: {lvl2: {password: 'secret'}}});
      const expected = {lvl1: {lvl2: {password: '***'}}};
      expect(actual).toEqual(expected);
    });

    it('should preserve arrays', () => {
      const actual = componentInst.maskPasswordFields({arr: [1, 2, 'password']});
      const expected = {arr: [1, 2, 'password']};
      expect(actual).toEqual(expected);
    });
  });
});

class MockNgbActiveModal {
}
