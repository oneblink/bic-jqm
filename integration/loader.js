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
    'BMP.Blobs': '/blink/bmp-blobs',
    BlinkForms: '/blink/forms3jqm',
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
    'jquerymobile',
    'text!template-category-list.mustache',
    'text!template-form.mustache',
    'text!template-inputPrompt.mustache',
    'text!template-interaction.mustache',
    'text!template-pending.mustache',
    'text!template-popup.mustache'
  ], function (Promise, $, _, Backbone, BMP, Mustache, BlinkForms) {
  window.BlinkForms = BlinkForms;
  window.Mustache = Mustache;
  window.Promise = Promise;

  require(['main'], function () {
    console.log('BIC started!');
  });
});
