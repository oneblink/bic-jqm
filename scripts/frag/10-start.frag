// Begin!
(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        define('bic', [
            'feature!promises',
            'jquery',
            'underscore',
            'backbone',
            'mustache',
            'BlinkForms',
            'jquerymobile',
            'BMP.Blobs',
            'modernizr',
            'feature!es5'
        ], factory);
    } else {
        root.bic = factory();
    }
}(this, function (Promise, $, _, Backbone, Mustache, BlinkForms, jquerymobile, BMP, Modernizr) {
