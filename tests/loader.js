require.config({
  // karma's serves resources from /base/...
  baseUrl: window.__karma__ ? '/base/' : '/',
  paths: {
    bic: 'src/bic',
    implementations: 'src/implementations',
    chai: 'node_modules/chai/chai',
    'is-indexeddb-reliable': 'node_modules/is-indexeddb-reliable/dist/index',
    feature: 'node_modules/amd-feature/feature',
    '@blinkmobile/geolocation': 'node_modules/@blinkmobile/geolocation/geolocation',
    '@jokeyrhyme/deadline': 'node_modules/@jokeyrhyme/deadline/dist/index',
    '@jokeyrhyme/promised-requirejs': 'node_modules/@jokeyrhyme/promised-requirejs/dist/index',
    'generic-middleware': 'vendor/generic-middleware',
    'typed-errors': 'node_modules/js-typed-errors/dist/typed-errors',
    Squire: 'node_modules/squirejs/src/Squire',
    pollUntil: 'node_modules/poll-until/poll-until',
    mustache: 'node_modules/mustache/mustache',
    BlinkGap: 'node_modules/blinkgap-utils/BMP.BlinkGap',
    sinon: 'node_modules/sinon/pkg/sinon',
    raw: 'node_modules/text/text',
    uuid: 'node_modules/node-uuid/uuid',
    domReady: 'node_modules/domReady/domReady'
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
  'chai',
  'backbone',
  'feature!promises',
  'feature!es5',
  'BlinkGap',
  'tests/unit/api-web',
  'tests/unit/collection-datasuitcases',
  'tests/unit/collection-forms',
  'tests/unit/collection-interactions',
  'tests/unit/collection-pending',
  'tests/unit/collection-stars',
  'tests/unit/data-pouch',
  'tests/unit/form-expressions',
  'tests/unit/model-application',
  'tests/unit/model-datasuitcase',
  'tests/unit/model-form',
  'tests/unit/model-interaction',
  'tests/unit/model-pending',
  'tests/unit/model-star',
  'tests/unit/promise-blinkgap',
  'tests/unit/router',
  'tests/unit/view-interaction',
  'tests/unit/view-interaction-form',
  'tests/unit/view-star',
  'tests/unit/view-form',
  'tests/unit/view-form-action',
  'tests/unit/view-form-controls',
  'tests/unit/view-error-summary-list',
  'tests/unit/model-form-record',
  'tests/unit/collection-form-records',
  'tests/unit/lib/parse-form-child-xml',
  'tests/unit/lib/url-path-parser'
], function (chai, Backbone, Promise) {
  'use strict';

  window.assert = chai.assert;
  window.expect = chai.expect;

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

  if (window.__karma__) {
    window.__karma__.start();
  } else {
    window.mocha.run();
  }
});
