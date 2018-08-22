import { TestBed, inject } from '@angular/core/testing';

import { RuntimeErrorHandlerService } from './runtime-error-handler.service';
import { VersionService } from '../version/version.service';

describe('RuntimeErrorHandlerService', () => {
  let service: RuntimeErrorHandlerService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        RuntimeErrorHandlerService,
        {provide: VersionService, useClass: MockVersionService},
      ]
    });

    service = TestBed.get(RuntimeErrorHandlerService);
  });

  afterEach(() => {
    for (const e of Array.from(document.querySelectorAll('.modal.error'))) {
      e.parentNode.removeChild(e);
    }
  });

  it('should display an error overlay', () => {
    const error = new Error('error-text');
    if (!error.stack) {
      // for phantom js..
      error.stack = 'Error: error-text';
    }

    service.handleError(error);

    const modalText = document.querySelector('.modal.error').textContent;
    expect(modalText).toContain('error-text', 'should contain error message');
    expect(modalText).toContain('Error: error-text', 'should contain stack trace');
    expect(modalText).toContain('version-text', 'should contain version');
  });

  it('should only display one overlay on successive errors', () => {
    const error = new Error('error-text');

    service.handleError(error);
    service.handleError(error);

    expect(document.querySelectorAll('.modal.error').length).toBe(1);
  });

  it('should not crash if error does not contain any property', () => {
    expect(() => service.handleError({})).not.toThrow();
  });

  it('should not dump object if no stack is available', () => {
    const error = {message: 'object-dump'};

    service.handleError(error);

    const modalText = document.querySelector('.modal.error').textContent;
    expect(modalText).toContain('object-dump', 'should display message property');
    expect(modalText).toContain(JSON.stringify(error), 'should display JSON dump');
  });
});


class MockVersionService extends VersionService {
  getFormattedFull(): string {
    return 'version-text';
  }
}
