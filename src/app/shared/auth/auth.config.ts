

/**
 * Configuration settings for the JWT authentication system. This exported configuration
 * is used to configure the JWT library in the auth module.
 *
 * For options and details see https://github.com/auth0/angular2-jwt#configuration-options
 */
export const APP_AUTH_CONFIG = {
  /** Field name to store the session token in the session/local store of the browser */
  tokenName: 'authinfo',
  sessionUserTokenName: 'sessionUser',
  authHeaderName: 'Authorization',
  /** Regular expression to match URLs where the JWT token is appended */
  urlMatcher: /^\/api/,
};
