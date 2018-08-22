// Protractor configuration file, see link for more information
// https://github.com/angular/protractor/blob/master/lib/config.ts

const argv = require('yargs').argv;

/*global jasmine */
const { SpecReporter } = require('jasmine-spec-reporter');
const { JUnitXmlReporter } = require('jasmine-reporters');
const path = require('path');
const HtmlScreenshotReporter = require('protractor-jasmine2-screenshot-reporter');
const screenshotReporter = new HtmlScreenshotReporter({
  dest: 'target/e2e/screenshots',
  ignoreSkippedSpecs: true,
  captureOnlyFailedSpecs: true,
  showSummary: true,
  showQuickLinks: true,
  showConfiguration: true,
  filename: 'e2e-report.html',
  pathBuilder: function (currentSpec, suites, browserCapabilities) {
    return path.join(currentSpec.fullName.slice(0, -currentSpec.description.length).trim(), currentSpec.fullName.trim());
  }
});

let browsers = 'chrome';
if (argv.browsers) {
  //protractor needs lowercase browsernames (https://github.com/SeleniumHQ/selenium/wiki/DesiredCapabilities)
  browsers = argv.browsers && argv.browsers.toLowerCase();
}

// "normalize" browser names
if (browsers.startsWith('chrome')) {
  browsers = 'chrome'
}
//TODO other browsers?

console.log('Protractor using browsers:', browsers);
exports.config = {
  allScriptsTimeout: 11000,
  specs: [
    './e2e/**/*.e2e-spec.ts'
  ],
  capabilities: {
    'browserName': browsers,
    // all this options are a fix for chrome 58 on windows
    chromeOptions: {
      args: [
        '--headless',
        '--disable-infobars',
        '--no-sandbox',
        '--disable-extensions'
      ],
      prefs: {
        // disable chrome's password manager
        'profile.password_manager_enabled': false,
        'credentials_enable_service': false,
        'password_manager_enabled': false
      }
    }
  },
  directConnect: true,
  baseUrl: 'http://localhost:4200/ui/',
  framework: 'jasmine',
  jasmineNodeOpts: {
    showColors: true,
    defaultTimeoutInterval: 30000,
    print: function() {}
  },
  beforeLaunch: function() {
    return new Promise(function (resolve) {
      screenshotReporter.beforeLaunch(resolve);
    });
  },
  onPrepare() {
    // Register matcher and other methods
    const helper = require('protractor-helpers');
    require('ts-node').register({
      project: 'e2e/tsconfig.e2e.json'
    });
    jasmine.getEnv().addReporter(new SpecReporter({ spec: { displayStacktrace: true } }));
    jasmine.getEnv().addReporter(new JUnitXmlReporter({
      consolidateAll: true,
      savePath: 'target/e2e/',
      filePrefix: 'e2e-test-webchannel'
    }));
    jasmine.getEnv().addReporter(screenshotReporter);

    // close all toasts after each spec
    afterEach(() => element.all(by.id('toast-container')).$$('button').click());

    helper.safeGet('/');
  },
  afterLaunch: function(exitCode) {
    return new Promise(function(resolve){
      screenshotReporter.afterLaunch(resolve.bind(this, exitCode));
    });
  }
};
