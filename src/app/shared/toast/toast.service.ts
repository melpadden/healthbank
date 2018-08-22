import {Injectable} from '@angular/core';
import {ActiveToast, GlobalConfig, IndividualConfig, ToastrService} from 'ngx-toastr';
import {TranslateService} from '@ngx-translate/core';

const toastConfig = {
  successTimeout: 2000
};

export const defaultToastConfig: Partial<IndividualConfig> = {
  timeOut: 5000,
  extendedTimeOut: 1000,
  progressBar: true,
  positionClass: 'toast-top-center',
  tapToDismiss: false,
  closeButton: true,
};

export const globalToastConfig: Partial<GlobalConfig> = {
  ...defaultToastConfig,
  autoDismiss: false,
};

@Injectable()
export class ToastService {
  private activeToast: ActiveToast;
  private toastsToBeCleared: ActiveToast[];

  constructor(private toastrService: ToastrService,
              private translate: TranslateService) {
    this.toastsToBeCleared = [];
  }

  success(messageKey: string, titleKey?: string, clearOnPageChange = false): ActiveToast {
    this.clear();
    const messages = {};
    this.resolveTranslations(messageKey, titleKey, messages);
    const toast = this.toastrService
      .success(messages['message'], messages['title'], {...defaultToastConfig, timeOut: toastConfig.successTimeout});
    this.activeToast = toast;
    if (clearOnPageChange) {
      this.toastsToBeCleared.push(toast);
    }
    return toast;
  }

  info(messageKey: string, titleKey?: string, clearOnPageChange = false): ActiveToast {
    this.clear();
    const messages = {};
    this.resolveTranslations(messageKey, titleKey, messages);
    // setting configuration globally seems to be buggy, therefore setting it on every call
    const toast = this.toastrService.info(messages['message'], messages['title'], defaultToastConfig);
    this.activeToast = toast;
    if (clearOnPageChange) {
      this.toastsToBeCleared.push(toast);
    }
    return toast;
  }

  warning(messageKey: string, titleKey?: string, clearOnPageChange = false): ActiveToast {
    this.clear();
    const messages = {};
    this.resolveTranslations(messageKey, titleKey, messages);
    const toast = this.toastrService.warning(messages['message'], messages['title'], defaultToastConfig);
    this.activeToast = toast;
    if (clearOnPageChange) {
      this.toastsToBeCleared.push(toast);
    }
    return toast;
  }

  error(messageKey: string, titleKey?: string, clearOnPageChange = true): ActiveToast {
    this.clear();
    const messages = {};
    this.resolveTranslations(messageKey, titleKey, messages);
    const toast = this.toastrService.error(messages['message'], messages['title'], defaultToastConfig);
    this.activeToast = toast;
    if (clearOnPageChange) {
      this.toastsToBeCleared.push(toast);
    }
    return toast;
  }

  clear(toast?: ActiveToast): void {
    this.activeToast = undefined;
    if (typeof toast !== 'undefined') {
      this.toastrService.clear(toast.toastId);
    } else {
      this.toastrService.clear();
    }
  }

  clearOnPageChange() {
    if (this.toastsToBeCleared) {
      for (const t of this.toastsToBeCleared) {
        this.clear(t);
      }
    }
    this.toastsToBeCleared = [];
  }

  private resolveTranslations(messageKey: string, titleKey: string, translations: {}) {
    if (messageKey) {
      this.translate.get(titleKey).subscribe((translated) => {
        translations['title'] = translated;
      });
    }
    if (titleKey) {
      this.translate.get(messageKey).subscribe((translated) => {
        translations['message'] = translated;
      });
    }
  }
}
