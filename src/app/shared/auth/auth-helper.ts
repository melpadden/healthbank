/*
 * Helper methods for the authentications
 */
import { Headers, RequestOptionsArgs } from '@angular/http';
import { HttpHeaders, HttpRequest } from '@angular/common/http';
import { APP_AUTH_CONFIG } from './auth.config';


/**
 * If a JWT token is available, add it to the provided request options
 */
export function addJwtHeader(options?: RequestOptionsArgs) {
  const token = getJwtToken();

  if (token) {
    if (!options) {
      options = {};
    }

    if (!options.headers) {
      options.headers = new Headers();
    }

    if (!options.headers.has(APP_AUTH_CONFIG.authHeaderName)) {
      options.headers.append(APP_AUTH_CONFIG.authHeaderName, 'Bearer ' + token);
      console.log('Adding JWT token to request');
    } else {
      console.log(`Request has already an ${APP_AUTH_CONFIG.authHeaderName} header set, omit to add JWT token`);
    }
  }

  return options;
}

export function getJwtAuthHeader(req: HttpRequest<any>): HttpHeaders {
  const token = getJwtToken();

  if (token) {
    if (!req.headers.has(APP_AUTH_CONFIG.authHeaderName)) {
      return req.headers.set(APP_AUTH_CONFIG.authHeaderName, 'Bearer ' + token);
    } else {
      console.log(`Request has already an ${APP_AUTH_CONFIG.authHeaderName} header set, omit to add JWT token`);
    }
  }

  return req.headers;
}

/**
 * Retrieves the undecoded JWT token or null;
 */
export function getJwtToken(): string | null {
  return window.sessionStorage.getItem(APP_AUTH_CONFIG.tokenName);
}

/**
 * Retrieves the json string of the user from the sessionStorage or null;
 */
export function getUser(token: string): string | null {
  return window.sessionStorage.getItem(token);
}
