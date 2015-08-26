// Begin!
(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        define('bic', [
            'feature!promises',
            'jquery',
            'underscore',
            'backbone',
            'mustache',
            'jquerymobile',
            'BMP.Blobs',
            'modernizr',
            'pouchdb',
            'pollUntil',
            'feature!es5',
            'BlinkGap'
        ], factory);
    } else {
        root.bic = factory();
    }
}(this, function (Promise, $, _, Backbone, Mustache, jquerymobile, BMP, Modernizr, Pouch, pollUntil) {
  window.pollUntil = pollUntil;
