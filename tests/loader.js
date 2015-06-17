/*eslint-disable no-unused-vars*/
var assert = chai.assert;
var should = chai.should();
var expect = chai.expect;
/*eslint-enable no-unused-vars*/

require.config({
  baseUrl: '/src',
  paths: {
    'is-indexeddb-reliable': '/node_modules/is-indexeddb-reliable/dist/index',
    feature: '/node_modules/amd-feature/feature',
    geolocation: '/node_modules/geolocation/geolocation',
    Squire: '/node_modules/squirejs/src/Squire',
    pollUntil: '/node_modules/poll-until/poll-until',
    mustache: '/node_modules/mustache/mustache',
    BlinkGap: '/node_modules/blinkgap-utils/BMP.BlinkGap',
    sinon: '/node_modules/sinon/pkg/sinon',
    text: '/node_modules/text/text',
    uuid: '/node_modules/node-uuid/uuid',
    domReady: '/node_modules/domReady/domReady'
  },
  shim: {
    BlinkGap: {
      deps: ['pollUntil'],
      exports: 'BMP.BlinkGap'
    },
    pouchdb: {
      deps: ['feature!es5']
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
window.Modernizr = { indexeddb: false };

require([
  'backbone',
  'feature!promises',
  'feature!es5',
  'jquery',
  'jquerymobile',
  'BlinkGap',
  '/tests/unit/api-web.js',
  '/tests/unit/collection-datasuitcases.js',
  '/tests/unit/collection-forms.js',
  '/tests/unit/collection-interactions.js',
  '/tests/unit/collection-pending.js',
  '/tests/unit/collection-stars.js',
  '/tests/unit/data-pouch.js',
  '/tests/unit/model-application.js',
  '/tests/unit/model-datasuitcase.js',
  '/tests/unit/model-form.js',
  '/tests/unit/model-interaction.js',
  '/tests/unit/model-pending.js',
  '/tests/unit/model-star.js',
  '/tests/unit/promise-blinkgap.js',
  '/tests/unit/router.js',
  '/tests/unit/view-interaction.js',
  '/tests/unit/view-star.js',
  '/tests/unit/view-form-controls.js'
], function (Backbone, Promise) {
  'use strict';
  var runner, failedTests, logFailure;

  window.Promise = window.Promise || Promise;

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
