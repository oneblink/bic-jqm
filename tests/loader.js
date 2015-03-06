/*eslint-disable no-unused-vars*/
var should = chai.should();
var expect = chai.expect;
/*eslint-enable no-unused-vars*/

require.config({
  baseUrl: '/tests/',
  paths: {
    feature: '/node_modules/amd-feature/feature',
    geolocation: '/node_modules/geolocation/geolocation',
    Squire: '/node_modules/squirejs/src/Squire',
    pollUntil: '/node_modules/poll-until/poll-until',
    BlinkGap: '/src/vendor/BMP.BlinkGap',
    sinon: '/node_modules/sinon/pkg/sinon',
    text: '/node_modules/text/text'
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
  'jquery',
  'BlinkGap',
  'unit/api-web.js',
  'unit/collection-datasuitcases.js',
  'unit/collection-forms.js',
  'unit/collection-interactions.js',
  'unit/collection-pending.js',
  'unit/collection-stars.js',
  'unit/data-pouch.js',
  'unit/model-application.js',
  'unit/model-datasuitcase.js',
  'unit/model-form.js',
  'unit/model-interaction.js',
  'unit/model-pending.js',
  'unit/model-star.js',
  'unit/router.js',
  'unit/view-interaction.js',
  'unit/view-star.js'
], function (Promise, pollUntil, geolocation, Backbone, $) {
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

  $.mobile = {
    loading: function () {
      return null;
    },
    path: {
      parseUrl: function () {
        return {
          hrefNoSearch: '/test',
          path: '/test',
          search: ''
        };
      }
    },
    showPageLoadingMsg: function () {
      return null;
    },
    pageLoadErrorMessageTheme: {},
    pageLoadErrorMessage: {}
  };


  window.Promise = window.Promise || Promise;
  window.pollUntil = window.pollUntil || pollUntil;
  window.geolocation = window.geolocation || geolocation;

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
