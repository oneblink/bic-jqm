/* eslint-env node */
'use strict';

// Karma configuration
// Generated on Wed Jun 24 2015 14:36:20 GMT+1000 (AEST)
module.exports = function (config) {
  config.set({
    // base path that will be used to resolve all patterns (eg. files, exclude)
    basePath: './',

    // frameworks to use
    // available frameworks: https://npmjs.org/browse/keyword/karma-adapter
    frameworks: ['detectBrowsers', 'mocha', 'requirejs'],

    // list of files / patterns to load in the browser
    files: [
      { pattern: 'node_modules/chai/chai.js', included: false },
      { pattern: 'node_modules/is-indexeddb-reliable/dist/index.js', included: false },
      { pattern: 'node_modules/amd-feature/feature.js', included: false },
      { pattern: 'node_modules/@jokeyrhyme/deadline/dist/index.js', included: false },
      { pattern: 'node_modules/@jokeyrhyme/promised-requirejs/dist/index.js', included: false },
      { pattern: 'node_modules/js-typed-errors/dist/typed-errors.js', included: false },
      { pattern: 'node_modules/@blinkmobile/geolocation/geolocation.js', included: false },
      { pattern: 'node_modules/squirejs/src/Squire.js', included: false },
      { pattern: 'node_modules/poll-until/poll-until.js', included: false },
      { pattern: 'node_modules/mustache/mustache.js', included: false },
      { pattern: 'node_modules/blinkgap-utils/BMP.BlinkGap.js', included: false },
      { pattern: 'node_modules/sinon/pkg/sinon.js', included: false },
      { pattern: 'node_modules/text/text.js', included: false },
      { pattern: 'node_modules/node-uuid/uuid.js', included: false },
      { pattern: 'node_modules/domReady/domReady.js', included: false },

      // wildcards for included:false must not clash with included:true
      { pattern: 'src/bic/**/*.js', included: false },
      { pattern: 'src/**/*.mustache', included: false },
      { pattern: 'src/*.js', included: false },
      'src/frag/00-config.js',

      // wildcards for included:false must not clash with included:true
      { pattern: 'tests/unit/**/*.js', included: false },
      { pattern: 'tests/assets/**/*.xml', included: false },
      'tests/loader.js'
    ],

    client: {
      mocha: {
        ui: 'bdd',
        reporter: 'html'
      }
    },

    // list of files to exclude
    exclude: [
    ],

    // preprocess matching files before serving them to the browser
    // available preprocessors: https://npmjs.org/browse/keyword/karma-preprocessor
    preprocessors: {
    },

    // test results reporter to use
    // possible values: 'dots', 'progress'
    // available reporters: https://npmjs.org/browse/keyword/karma-reporter
    reporters: ['progress'],

    // web server port
    port: 9879,

    // enable / disable colors in the output (reporters and logs)
    colors: true,

    // level of logging
    // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
    logLevel: config.LOG_INFO,

    // enable / disable watching file and executing tests whenever any file changes
    autoWatch: true,

    captureTimeout: 60000,

    // Continuous Integration mode
    // if true, Karma captures browsers, runs the tests and exits
    singleRun: true
  });
};
