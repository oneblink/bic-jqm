// Temporary Fixes
// These will end up in Global Require (I hope...)
requirejs.config({
  paths: {
    BlinkForms: ['/_BICv3_/js/BlinkForms-jQueryMobile.min'],
    pouchdb: ['/_BICv3_/js/pouchdb-nightly'],
    'BMP.Blobs': ['/_BICv3_/js/bmp-blobs.min']
  },
  shim: {
    'BlinkForms': {
      exports: 'BlinkForms'
    },
    'pouchdb': {
      exports: 'Pouch'
    },
    'BMP.Blobs': {
      deps: ['underscore', 'jquery'],
      exports: 'BMP'
    },
  }
});

// Begin!
(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        define('bic', [
            'jquery',
            'underscore',
            'backbone',
            'mustache',
            'pouchdb',
            'BlinkForms',
            'jquerymobile',
            'BMP.Blobs'
        ], factory);
    } else {
        root.bic = factory();
    }
}(this, function ($, _, Backbone, Mustache, Pouch, BlinkForms, jquerymobile, BMP) {
