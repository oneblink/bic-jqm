window.Modernizr = {
  indexeddb: false
};

require.config({
  paths: {
    jquery: '../bower_components/jquery/jquery',
    underscore: '../bower_components/underscore/underscore',
    backbone: '../bower_components/backbone/backbone',
    feature: '../bower_components/amd-feature/feature',
    domReady: '../bower_components/requirejs-domready/domReady',
    text: '../bower_components/requirejs-text/text',
    'BMP.Blobs': '../blink/bmp-blobs.min',
    BlinkForms: '../blink/forms3jqm.min',
    jquerymobile: '../bower_components/jquery-mobile-bower/js/jquery.mobile-1.3.2',
    moment: '../../bower_components/momentjs/min/moment.min',
    picker: '../../bower_components/pickadate/lib/picker',
    'picker.date': '../../bower_components/pickadate/lib/picker.date',
    'picker.time': '../../bower_components/pickadate/lib/picker.time',
    implementations: '../tests/implementations'
  },
  shims: {
    underscore: {
      exports: '_'
    },
    backbone: {
      deps: ['jquery', 'underscore'],
      exports: 'Backbone'
    },
    'BMP.Blobs': {
      deps: ['underscore', 'jquery'],
      exports: 'BMP'
    },
    'BlinkForms': {
      deps: ['signaturepad', 'BMP.Blobs'],
      exports: 'BMP.Forms'
    },
  },
  baseUrl: '../scripts'
});

define(['jquery', 'underscore', 'backbone', 'BMP.Blobs', 'BlinkForms'], function () {
  require(['../scripts/main'], function () {
    console.log('BIC started!');
  });
});
