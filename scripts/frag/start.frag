// Temporary Fixes
// These will end up in Global Require (I hope...)
requirejs.config({
  paths: {
    BlinkForms: ['/_BICv3_/js/BlinkForms-jQueryMobile.min'],
    pouchdb: ['/_BICv3_/js/pouchdb-nightly'],
    'BMP.Blobs': ['/_BICv3_/js/bmp-blobs.min'],
    signaturepad: ['/_c_/signaturepad/2.3.0/jq.sig.min']
  },
  shim: {
    'BlinkForms': {
      deps: ['signaturepad', 'BMP.Blobs'],
      exports: 'BlinkForms'
    },
    'pouchdb': {
      exports: 'Pouch'
    },
    'BMP.Blobs': {
      deps: ['underscore', 'jquery'],
      exports: 'BMP'
    },
    'signaturepad': {
      deps: ['jquery'],
      exports: '$'
    } 
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
            'BMP.Blobs',
            'modernizr'
        ], factory);
    } else {
        root.bic = factory();
    }
}(this, function ($, _, Backbone, Mustache, Pouch, BlinkForms, jquerymobile, BMP, Modernizr) {
