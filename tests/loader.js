/*global mocha:true, chai:true */

require.config({
  baseUrl: '/tests/',
  paths: {
    feature: '/bower_components/amd-feature/feature',
    implementations: 'implementations',
    Squire: '/bower_components/squire/src/Squire',
    pouchdb: '/bower_components/pouchdb/dist/pouchdb-nightly',
    uuid: '/bower_components/node-uuid/uuid',
    pollUntil: '/node_modules/poll-until/poll-until',
    BlinkGap: '/scripts/vendor/BMP.BlinkGap',
    text: '../bower_components/requirejs-text/text'
  },
  shim: {
    BlinkGap: {
      deps: ['pollUntil'],
      exports: 'BMP.BlinkGap'
    }
  }
});
mocha.setup('bdd');
var should = chai.should();
var expect = chai.expect;

window.BMP = {
  BIC: {
    siteVars: {
      answerSpace: 'Exists',
      answerSpaceId: 1
    }
  },
  FileInput: {
    initialize: function () {
      "use strict";
      return "hello!";
    }
  }
};
window.Modernizr = {indexeddb: false};
window.BlinkForms = {};

/*jslint unparam: true */
Backbone.sync = function (method, model, options) {
  "use strict";
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
/*jslint unparam: false */

$.mobile = {
  loading: function () {
    "use strict";
    return null;
  },
  path: {
    parseUrl: function () {
      "use strict";
      return {
        hrefNoSearch: "/test",
        search: ""
      };
    }
  },
  showPageLoadingMsg: function () {
    "use strict";
    return null;
  },
  pageLoadErrorMessageTheme: {},
  pageLoadErrorMessage: {}
};

require([
  'feature!promises',
  'pollUntil',
  'BlinkGap',
  'test-api-web.js',
  'test-collection-datasuitcases.js',
  'test-collection-forms.js',
  'test-collection-interactions.js',
  'test-collection-pending.js',
  'test-collection-stars.js',
  'test-data-pouch.js',
  'test-model-application.js',
  'test-model-datasuitcase.js',
  'test-model-form.js',
  'test-model-interaction.js',
  'test-model-pending.js',
  'test-model-star.js',
  'test-router.js',
  'test-view-interaction.js',
  'test-view-star.js'
], function (Promise, pollUntil) {
  "use strict";
  if (!window.Promise) {
    window.Promise = Promise;
  }
  window.pollUntil = window.pollUntil || pollUntil;

  var runner, failedTests, logFailure;

  runner = mocha.run();
  failedTests = [];
  logFailure = function (test, err) {
    var flattenTitles = function (test) {
      var titles = [];
      while (test.parent.title) {
        titles.push(test.parent.title);
        test = test.parent;
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
