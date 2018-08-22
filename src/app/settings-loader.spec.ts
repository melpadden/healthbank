import { ENV_SETTINGS_TOKEN, EnvSettings } from './settings-loader';

export const ENV_SETTING_TEST = {
  timelineApiHost: '',
  identityApiHost: ''
} as EnvSettings;

export const ENV_SETTING_TEST_PROVIDER = {
  provide: ENV_SETTINGS_TOKEN, useValue: ENV_SETTING_TEST
};
