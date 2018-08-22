// The file contents for the current environment will overwrite these during build.
// The build system defaults to the dev environment which uses `environment.ts`, but if you do
// `ng build --env=prod` then `environment.prod.ts` will be used instead.
// The list of which env maps to which file can be found in `.angular-cli.json`.

export const environment = {
  production: false,

  // workaround for angular CLI bug for serving the asset folder
  // https://github.com/angular/angular-cli/issues/5268
  assets: 'assets',

  // same as webapp
  baseApiHost: 'https://dev-identity.azurewebsites.net',
  /*
    timelineApiHost: 'https://dev-identity.azurewebsites.net',
    identityApiHost: 'https://dev-identity.azurewebsites.net',
    */
  timelineApiHost: "https://dev-timeline.healthbank.me",
  identityApiHost: "https://dev-identity.healthbank.me",
  qrConvertApiHost: "https://documedis.hcisolutions.ch/app/medication/medicationplan"
};
