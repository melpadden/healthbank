// Karma configuration file, see link for more information
// https://karma-runner.github.io/1.0/config/configuration-file.html

const argv = require('yargs').argv;

const DEFAULT_BROWSER = 'ChromeHeadless';

module.exports = function (config) {
  let useUrl = 'http://localhost:8080';
  if (argv.useUrl) {
    useUrl = argv.useUrl;
    console.log('Using backend:', useUrl);
  }

  config.set({
    basePath: '',
    frameworks: ['jasmine', '@angular/cli'],
    plugins: [
      require('karma-firefox-launcher'),
      require('karma-ie-launcher'),
      require('karma-phantomjs-launcher'),
      require('karma-jasmine'),
      require('karma-chrome-launcher'),
      require('karma-jasmine-html-reporter'),
      require('karma-junit-reporter'),
      require('karma-mocha-reporter'),
      require('karma-coverage-istanbul-reporter'),
      require('@angular/cli/plugins/karma')
    ],
    client:{
      clearContext: false, // leave Jasmine Spec Runner output visible in browser
    },
    files: [
      config.angularCli && config.angularCli.codeCoverage ? 'src/test-common/test-execution-logger.js' : '!src/test-common/test-execution-logger.js',
      'src/test-common/jasmine-settings.js',
      { pattern: './src/test.ts', watched: false }
    ],
    coverageIstanbulReporter: {
      reports: [ 'html', 'lcovonly', 'cobertura', 'text-summary' ],
      fixWebpackSourcePaths: true
    },
    angularCli: {
      environment: 'dev'
    },
    reporters: config.angularCli && config.angularCli.codeCoverage
              ? ['mocha', 'junit', 'coverage-istanbul']
              : ['mocha', 'kjhtml'],
    port: 9876,
    colors: true,
    logLevel: config.LOG_INFO,
    autoWatch: true,
    browsers: [DEFAULT_BROWSER],
    singleRun: false,

    customLaunchers: {
      ChromeCI: {
        base: 'ChromeHeadless',
        flags: ['--no-sandbox']
      }
    },
    browserNoActivityTimeout: 90000,
    junitReporter: {
      outputDir: 'target/unit-tests/reports',
      outputFile: 'unit-test-webchannel.xml',
      suite: 'webchannel',
      useBrowserName: true,
      nameFormatter: undefined,
      classNameFormatter: undefined
    },
    mochaReporter: {
      ignoreSkipped: true,
      output: 'autowatch',
      maxLogLines: 50
    },
    proxies: {
      '/api/': useUrl + '/api/',
    },
    proxyValidateSSL: false,
    reportSlowerThan: 900
  });
};
