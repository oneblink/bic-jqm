/*eslint-disable no-unused-vars*/
var assert = chai.assert;
var should = chai.should();
var expect = chai.expect;
/*eslint-enable no-unused-vars*/

require.config({
  baseUrl: '/src',
  paths: {
    implementations: '../tests/implementations',
    feature: '/node_modules/amd-feature/feature',
    geolocation: '/node_modules/geolocation/geolocation',
    Squire: '/node_modules/squirejs/src/Squire',
    pollUntil: '/node_modules/poll-until/poll-until',
    mustache: '/node_modules/mustache/mustache',
    BlinkGap: '/node_modules/blinkgap-utils/BMP.BlinkGap',
    sinon: '/node_modules/sinon/pkg/sinon',
    text: '/node_modules/text/text',
    uuid: '/node_modules/node-uuid/uuid',
    'form-dependencies': 'frag/99-form_extensions',
    domReady: '../bower_components/requirejs-domready/domReady',
    bic: '/tests/support/bic'
  },
  shim: {
    BlinkGap: {
      deps: ['pollUntil'],
      exports: 'BMP.BlinkGap'
    }
  }
});

mocha.setup('bdd');

window.BMP = {
  BIC: {
    siteVars: {
      answerSpace: 'Exists',
      answerSpaceId: 1
    }
  },
  FileInput: {
    initialize: function () {
      'use strict';
      return 'hello!';
    }
  }
};
window.Modernizr = {indexeddb: false};
window.BlinkForms = {};

require([
  'feature!promises',
  'pollUntil',
  'geolocation',
  'backbone',
  'mustache',
  'jquery',
  'jquerymobile',
  'feature!es5',
  'BlinkGap',
  '/tests/cascadeSelect/test.js'

], function (Promise, pollUntil, geolocation, Backbone, Mustache) {
  'use strict';
  var runner, failedTests, logFailure;

  Backbone.sync = function (method, model, options) {
    var promise = Promise.resolve({});

    promise.then(function (response) {
      if (options.success) {
        options.success(response);
      }
    }, function (response) {
      if (options.error) {
        options.error(response);
      }
    });

    return promise;
  };

  window.Mustache = Mustache;
  window.Promise = window.Promise || Promise;
  window.pollUntil = window.pollUntil || pollUntil;
  window.geolocation = window.geolocation || geolocation;
  BMP.Expression = {
    fn: {}
  };
  runner = mocha.run();
  failedTests = [];
  logFailure = function (test, err) {
    var flattenTitles = function (innerTest) {
      var titles = [];
      while (innerTest.parent.title) {
        titles.push(innerTest.parent.title);
        innerTest = innerTest.parent;
      }
      return titles.reverse();
    };
    failedTests.push({name: test.title, result: false, message: err.message, stack: err.stack, titles: flattenTitles(test) });
  };

  runner.on('end', function () {
    window.mochaResults = runner.stats;
    window.mochaResults.reports = failedTests;
  });

  runner.on('fail', logFailure);
});
