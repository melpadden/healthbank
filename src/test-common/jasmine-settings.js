/**
 * Settings for jasmine and other common test configuration
 */

jasmine.DEFAULT_TIMEOUT_INTERVAL = 10 * 1000;

// enforce to be logged out at the start of the test run
window.sessionStorage.clear();
window.localStorage.clear();
