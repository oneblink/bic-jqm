window.Modernizr = {
  indexeddb: true
};

require.config({
  paths: {
    jquery: '/bower_components/jquery/jquery',
    underscore: '/bower_components/underscore/underscore',
    backbone: '/node_modules/backbone/backbone',
    feature: '/bower_components/amd-feature/feature',
    domReady: '/bower_components/requirejs-domready/domReady',
    text: '/bower_components/requirejs-text/text',
    'BMP.Blobs': '//d1c6dfkb81l78v.cloudfront.net/blink/blobs/1377493706402/bmp-blobs.min',
    BlinkForms: '//d1c6dfkb81l78v.cloudfront.net/blink/forms/3/3.1.1/forms3jqm.min',
    signaturepad: '//d1c6dfkb81l78v.cloudfront.net/signaturepad/2.3.0/jq.sig.min',
    jquerymobile: '/bower_components/jquery-mobile-bower/js/jquery.mobile-1.3.2',
    pollUntil: '/node_modules/poll-until/poll-until',
    BlinkGap: '/scripts/vendor/BMP.BlinkGap',
    moment: '/bower_components/momentjs/min/moment.min',
    picker: '/bower_components/pickadate/lib/picker',
    'picker.date': '/bower_components/pickadate/lib/picker.date',
    'picker.time': '/bower_components/pickadate/lib/picker.time',
    mustache: '/bower_components/mustache/mustache',
    bluebird: '/bower_components/bluebird/js/browser/bluebird',
    pouchdb: '/bower_components/pouchdb/dist/pouchdb',
    implementations: '/tests/implementations',
    'es5-shim': '//d1c6dfkb81l78v.cloudfront.net/es5-shim/2.3.0/es5-shim.min',
    authentication: '../offlineLogin/authentication',
    sjcl: '../offlineLogin/node_modules/sjcl/sjcl'
  },
  shim: {
    'underscore': {
      exports: '_'
    },
    BlinkGap: {
      deps: ['pollUntil'],
      exports: 'BMP.BlinkGap'
    },
    'BMP.Blobs': {
      deps: ['underscore', 'jquery'],
      exports: 'BMP'
    },
    'signaturepad': {
      deps: ['jquery'],
      exports: '$'
    },
    sjcl: {
      exports: 'sjcl'
    },
    authentication: {
      deps: ['sjcl'],
      exports: 'Authentication'
    }
  },
  baseUrl: '/scripts'
});

require([
    'feature!promises',
    'jquery',
    'underscore',
    'backbone',
    'BMP.Blobs',
    'mustache',
    'BlinkForms',
    'pouchdb',
    'pollUntil',
    'authentication',
    'jquerymobile',
    'feature!es5',
    'BlinkGap'
  ], function (Promise, $, _, Backbone, BMP, Mustache, BlinkForms, Pouch, pollUntil, Authentication) {
  window.BlinkForms = BlinkForms;
  window.Mustache = Mustache;
  window.Promise = Promise;
  window.Pouch = Pouch;
  window.pollUntil = pollUntil;
  window.Authentication = Authentication;

  require(['main'], function () {
    console.log('BIC started!');
  });
});
