// Temporary Fixes
// These will end up in Global Require (I hope...)

var cloudfront = '//d1c6dfkb81l78v.cloudfront.net/';
var filesystem = '/_c_/';


requirejs.config({
  paths: {
    BlinkForms: [cloudfront + 'blink/forms/3/1377493706402/forms3jqm.min', filesystem + 'blink/forms/3/1377493706402/forms3jqm.min'],
    pouchdb: [cloudfront + 'pouchdb/1377451788000/pouchdb-nightly', filesystem + 'pouchdb/1377451788000/pouchdb-nightly'],
    'BMP.Blobs': [cloudfront + 'blink/blobs/1377493706402/bmp-blobs.min', filesystem + 'blink/blobs/1377493706402/bmp-blobs.min'],
    signaturepad: [cloudfront + 'signaturepad/2.3.0/jq.sig.min', filesystem + 'signaturepad/2.3.0/jq.sig.min'],
    jquerymobile: [cloudfront + 'jquery.mobile/1.4.0/jquery.mobile-1.4.0.min', filesystem + 'jquery.mobile/1.3.2/jquery.mobile-1.3.2.min'],
    jquery: [cloudfront + 'jquery/1.9.1/jquery.min', filesystem + 'jquery/1.9.1/jquery.min']
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
