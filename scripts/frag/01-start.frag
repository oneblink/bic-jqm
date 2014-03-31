// Begin!
(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        define('bic', [
            'jquery',
            'underscore',
            'backbone',
            'mustache',
            'BlinkForms',
            'jquerymobile',
            'BMP.Blobs',
            'modernizr'
        ], factory);
    } else {
        root.bic = factory();
    }
}(this, function ($, _, Backbone, Mustache, BlinkForms, jquerymobile, BMP, Modernizr) {
