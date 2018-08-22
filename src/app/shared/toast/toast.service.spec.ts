import {inject, TestBed} from '@angular/core/testing';
import {defaultToastConfig, ToastService} from './toast.service';
import {ActiveToast, ToastrModule, ToastrService} from 'ngx-toastr';
import {SharedModule} from '../shared.module';
import {TranslateService} from '@ngx-translate/core';
import {Observable} from 'rxjs/Observable';

describe('ToastService', () => {
  let toast: ToastService;
  let toastrClearSpy: jasmine.Spy;
  let toastrErrorSpy: jasmine.Spy;
  let toastrWarningSpy: jasmine.Spy;
  let toastrInfoSpy: jasmine.Spy;
  let toastrSuccessSpy: jasmine.Spy;
  let translate: TranslateService;
  let translateGetSpy: jasmine.Spy;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        ToastrModule.forRoot(defaultToastConfig),
        SharedModule,
      ]
    });
  });

  beforeEach(inject([ToastService, ToastrService, TranslateService],
    (toastSrvc: ToastService, toastrSrvc: ToastrService, translateService: TranslateService) => {
      toast = toastSrvc;
      toastrClearSpy = spyOn(toastrSrvc, 'clear');
      toastrErrorSpy = spyOn(toastrSrvc, 'error').and.returnValue({toastId: 1} as ActiveToast);
      toastrWarningSpy = spyOn(toastrSrvc, 'warning').and.returnValue({toastId: 2} as ActiveToast);
      toastrInfoSpy = spyOn(toastrSrvc, 'info').and.returnValue({toastId: 3} as ActiveToast);
      toastrSuccessSpy = spyOn(toastrSrvc, 'success').and.returnValue({toastId: 4} as ActiveToast);
      translate = translateService;
      translateGetSpy = spyOn(translateService, 'get').and.returnValue(Observable.of('translated message'));
    }));

  it('should clear and show success toast', () => {
    toast.success('successMessage', 'successTitle');

    expect(toastrClearSpy).toHaveBeenCalled();
    expect(toastrSuccessSpy).toHaveBeenCalled();
    expect(translateGetSpy).toHaveBeenCalledTimes(2);
    expect(translateGetSpy).toHaveBeenCalledWith('successTitle');
    expect(translateGetSpy).toHaveBeenCalledWith('successMessage');
  });

  it('should clear and show info toast', () => {
    toast.info('message', 'title');

    expect(toastrClearSpy).toHaveBeenCalled();
    expect(toastrInfoSpy).toHaveBeenCalled();
    expect(translateGetSpy).toHaveBeenCalledTimes(2);
    expect(translateGetSpy).toHaveBeenCalledWith('title');
    expect(translateGetSpy).toHaveBeenCalledWith('message');
  });

  it('should clear and show warning toast', () => {
    toast.warning('message', 'title');

    expect(toastrClearSpy).toHaveBeenCalled();
    expect(toastrWarningSpy).toHaveBeenCalled();
    expect(translateGetSpy).toHaveBeenCalledTimes(2);
    expect(translateGetSpy).toHaveBeenCalledWith('title');
    expect(translateGetSpy).toHaveBeenCalledWith('message');
  });

  it('should clear and show error toast', () => {
    toast.error('message', 'title');

    expect(toastrClearSpy).toHaveBeenCalled();
    expect(toastrErrorSpy).toHaveBeenCalled();
    expect(translateGetSpy).toHaveBeenCalledTimes(2);
    expect(translateGetSpy).toHaveBeenCalledWith('title');
    expect(translateGetSpy).toHaveBeenCalledWith('message');
  });

  it('should by default clear error toasts on page change but keep remaining', () => {
    const successToast = toast.success('message');
    toast.clearOnPageChange();
    expect(toastrClearSpy).not.toHaveBeenCalledWith(successToast.toastId);

    const infoToast = toast.info('message');
    toast.clearOnPageChange();
    expect(toastrClearSpy).not.toHaveBeenCalledWith(infoToast.toastId);

    const warningToast = toast.warning('message');
    toast.clearOnPageChange();
    expect(toastrClearSpy).not.toHaveBeenCalledWith(warningToast.toastId);

    const errorToast = toast.error('message');
    toast.clearOnPageChange();
    expect(toastrClearSpy).toHaveBeenCalledWith(errorToast.toastId);
  });
});
