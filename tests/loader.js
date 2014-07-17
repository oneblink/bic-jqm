/*global mocha:true, chai:true */

require.config({
  baseUrl: '/tests/',
  paths: {
    feature: '/bower_components/amd-feature/feature',
    implementations: 'implementations',
    Squire: '/bower_components/squire/src/Squire',
    pouchdb: '/bower_components/pouchdb/dist/pouchdb-nightly',
    uuid: '/bower_components/node-uuid/uuid'
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

Backbone.sync = function (method, model, options) {
  "use strict";
  var data, promise;
  data = model.data || model.collection.data;

  switch (method) {
  case "read":
    promise = model.id !== undefined ? data.read(model) : data.readAll();
    break;
  case "create":
    promise = data.create(model);
    break;
  case "update":
    //promise = data.update(model);
    promise = Promise.resolve();
    break;
  case "patch":
    promise = data.update(model);
    break;
  case "delete":
    //promise = data['delete'](model);
    promise = Promise.resolve();
    break;
  default:
    promise = Promise.reject(new Error('unknown method'));
  }

  promise.then(function (response) {
    if (options.success) {
      options.success(response);
    }
  }, function (response) {
    if (options.error) {
      options.error(response);
    }
  });

  model.trigger('request', model, promise, options);

  return promise;
};

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
], function (Promise) {
  "use strict";
  if (!window.Promise) {
    window.Promise = Promise;
  }

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
