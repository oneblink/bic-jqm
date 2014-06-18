window.Modernizr = {
  indexeddb: false
};

require.config({
  paths: {
    jquery: '/bower_components/jquery/jquery',
    underscore: '/bower_components/underscore/underscore',
    backbone: '/bower_components/backbone/backbone',
    feature: '/bower_components/amd-feature/feature',
    domReady: '/bower_components/requirejs-domready/domReady',
    text: '/bower_components/requirejs-text/text',
    'BMP.Blobs': 'http://d1c6dfkb81l78v.cloudfront.net/blink/blobs/1377493706402/bmp-blobs.min',
    BlinkForms: 'http://d1c6dfkb81l78v.cloudfront.net/blink/forms/3/3.1.1/forms3jqm.min',
    signaturepad: 'http://d1c6dfkb81l78v.cloudfront.net/signaturepad/2.3.0/jq.sig.min',
    jquerymobile: '/bower_components/jquery-mobile-bower/js/jquery.mobile-1.3.2',
    moment: '/bower_components/momentjs/min/moment.min',
    picker: '/bower_components/pickadate/lib/picker',
    'picker.date': '/bower_components/pickadate/lib/picker.date',
    'picker.time': '/bower_components/pickadate/lib/picker.time',
    sinon: '/bower_components/sinonjs/sinon',
    mustache: '/bower_components/mustache/mustache',
    bluebird: '/bower_components/bluebird/js/browser/bluebird',
    implementations: '/tests/implementations'
  },
  shim: {
    'underscore': {
      exports: '_'
    },
    'backbone': {
      deps: ['jquery', 'underscore'],
      exports: 'Backbone'
    },
    'BMP.Blobs': {
      deps: ['underscore', 'jquery'],
      exports: 'BMP'
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
    'jquerymobile',
  ], function (Promise, $, _, Backbone, BMP, Mustache, BlinkForms) {
  window.BlinkForms = BlinkForms;
  window.Mustache = Mustache;
  window.Promise = Promise;

  require(['main'], function () {
    console.log('BIC started!');
  });
});
