/**
 * Common rest response objects
 */
import { DateTime } from '../date/date.type';


/**
 * Structure of a error response from the REST interface.
 */
export interface RestError {
  error: string;
  payload?: any;
  details?: string[];
  message?: string;
  timestamp: DateTime;
  uuid: string;
  stacktrace?: string;
}

type NoErrorMessageKeys = string | {state: string, params?: any};

/**
 * Structure of a error handling config.
 */
export interface RestErrorHandleConfig {
  /**
   * Flag for the http error interceptor to not display error toasts when encountering
   * a 4xx error.
   */
  noErrorMsg?: boolean;
  /**
   * noErrorMsgKeys: The key specifies which errors should not be shown to the user
   * when encountering a 4xx error.; The value is used to redirect to a new state.
   */
  noErrorMsgKeys?: {[index: string]: NoErrorMessageKeys};
  errorMsgTitle?: string;
  overrideErrorMsg?: {[index: string]: string};
}
