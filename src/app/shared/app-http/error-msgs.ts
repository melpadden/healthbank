/**
 * Array with a mapping of error keys to human readable messages
 */


import {ResponseErrors} from './http-error.service';

// common error toasts
export const RESPONSE_ERROR_MESSAGES: ResponseErrors = {
  identity__not_found: ['error.toasts.title.identity__not_found', 'error.toasts.text.identity__not_found'],
  invitation__not_found: ['error.toasts.title.invitation__not_found', 'error.toasts.text.invitation__not_found'],
  identity__already_activated: ['error.toasts.title.identity__already_activated', 'error.toasts.text.identity__already_activated'],
  identity__mail_already_registered: ['error.toasts.title.identity__mail_already_registered',
    'error.toasts.text.identity__mail_already_registered'],
  identity__wrong_activation_code: ['error.toast.title.identity__wrong_activation_code',
    'error.toast.text.identity__wrong_activation_code'],
  item__not_found: ['error.toasts.title.item__not_found', 'error.toasts.text.item__not_found'],
  content__not_found: ['error.toasts.title.content__not_found', 'error.toasts.text.content__not_found'],
  mail__activation_error: ['error.toasts.title.mail__activation_error', 'error.toasts.text.mail__activation_error'],
  contact__already_exists: ['error.toasts.title.contact__already_exists', 'error.toasts.text.contact__already_exists'],
  contact__not_found: ['error.toasts.title.contact__not_found', 'error.toasts.text.contact__not_found'],
  contact__self_not_allowed: ['error.toasts.title.contact__self_not_allowed', 'error.toasts.text.contact__self_not_allowed'],
};

export const DEFAULT_BUSINESS_ERROR_MSG = {
    title: 'error.toast.default.business.error.title',
    message: 'error.toast.default.business.error.message'
  }
;
export const DEFAULT_TECHNICAL_ERROR_MSG =
  'Es ist ein technischer Fehler aufgetreten, der nicht automatisch korrigiert werden konnte. Bitte wenden Sie sich an den ' +
  'Support mit dem "Support Code" bzw. den unten angeführten Informationen.';
export const DEFAULT_UNAUTHORIZED_ERROR_MSG = {
    title: 'error.toast.default.unauthorized.error.title',
    message: 'error.toast.default.unauthorized.error.message'
  }
;

