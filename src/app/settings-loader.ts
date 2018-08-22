import { HttpClient } from '@angular/common/http';
import { InjectionToken } from '@angular/core';
import * as urlTemplate from 'url-template';

/**
 * Structure of ../env-settings.json
 */
export interface EnvSettings {
  timelineApiHost: string;
  identityApiHost: string;
  qrConvertApiHost: string,
  qrMetadataApiHost: string,
  organization: string;
  mediplanActive: boolean;
  authority: string,
  acceptLanguage: string,
  hciCustomerId: string,
  hciIndex: string,
  hciSoftware: string,
  hciSoftwareOrg: string,
  hciSoftwareOrgId: string,
  Accept: string
}

export const ENV_SETTINGS_TOKEN = new InjectionToken<string>('ENV_SETTINGS_TOKEN', );

let envSettings: EnvSettings = null;

export function envSettingsFactory() {
  return envSettings;
}

export function loadEnvSettings(http: HttpClient): () => Promise<EnvSettings> {
  return (): Promise<EnvSettings> => {
    const now = new Date().getTime();
    const safeUrl = urlTemplate.parse('env-settings.json?ts={now}').expand({ now });
    return http.get(safeUrl).toPromise()
      .then((setting: EnvSettings) => envSettings = setting);
  };
}
