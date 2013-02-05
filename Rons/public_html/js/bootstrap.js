/*jslint browser:true*/ // assume "window" and other browser globals
/*jslint white:true*/ // ignore white-space issues
/*global define:true, require:true*/ // globals from require.JS

/*jslint nomen:true*/ // rules for Underscore.JS

require.config({
  //enforceDefine: true,
  paths: {
    // Blink modules
    BlinkDispatch: 'lib/BlinkDispatch',
    BlinkStorage: 'lib/BlinkStorage',
    logger: '../../_c_/blink/logger-2',
    Math: 'lib/Math',
    blinkforms2: '/_R_/common/3/BlinkForms2',
    // loaders for 3rd-party modules
    PHP: 'lib/PHP',
    Hashtable: '//d1c6dfkb81l78v.cloudfront.net/jshashtable/require-jshashtable-2.1',
    jQuery: 'lib/jQuery',
    jQueryMobile: 'lib/jQueryMobile',
    Modernizr: 'lib/modernizr',
    // CDNs for minified 3rd-party non-AMD modules
    // NOTE: these have no capital letters, these are the pure versions
    backbone: [
      '//d1c6dfkb81l78v.cloudfront.net/backbonejs/0.9.2/backbone.min',
      '/_c_/backbonejs/0.9.2/backbone.min'
    ],
    jquery: [
      '//d1c6dfkb81l78v.cloudfront.net/jquery/1.7.2/jquery.min',
      '/_c_/jquery/1.7.2/jquery.min'
    ],
    underscore: [
      '//d1c6dfkb81l78v.cloudfront.net/underscorejs/1.3.3/underscore-min',
      '/_c_/underscorejs/1.3.3/underscore-min'
    ],
    jquerymobile: [
      '//d1c6dfkb81l78v.cloudfront.net/jquery.mobile/1.1.0/jquery.mobile.min',
      '/_c_/jquery.mobile/1.1.0/jquery.mobile.min'
    ],
    // paths for require.JS modules
    text: [
      '//d1c6dfkb81l78v.cloudfront.net/requirejs/2.0.2/text',
      '/_c_/requirejs/2.0.2/text'
    ],
    i18n: [
      '//d1c6dfkb81l78v.cloudfront.net/requirejs/2.0.2/i18n',
      '/_c_/requirejs/2.0.2/i18n'
    ]
  },
  shim: {
/*    'jquery': {
      deps: [],
      exports: 'jQuery'
    }, */
    'underscore': {
      deps: [],
      exports: '_'
    },
    'backbone': {
      deps: ['underscore', 'jquery'],
//      deps: ['underscore'],
      exports: 'Backbone'
    },
    'blinkforms2' : {
      deps: ['jquery', 'PHP'],
      exports: 'BlinkForms'
    }
  },
  waitSeconds: 20
});

define(['logger', 'app', 'jQuery'],
  function(logger, App, $) {
    'use strict';
    var Modernizr = window.Modernizr,
    fixJSON = function() {
      var dfrd = new $.Deferred(),
      testFn = function() {
        return !!window.JSON && !!window.JSON.stringify && !!window.JSON.parse;
      },
      endPromiseFn = function() {
        if (dfrd.state() === 'pending') {
          if (testFn()) {
            dfrd.resolve();
          } else {
            logger.error('JSON unsupported, application may be unstable');
            dfrd.reject();
          }
        }
      };
      /* END: var */
      logger.log('JSON supported: ' + testFn());
      Modernizr.load({
        test: testFn(),
        nope: '//d1c6dfkb81l78v.cloudfront.net/json2.min.js',
        callback: endPromiseFn,
        complete: endPromiseFn
      });
      return dfrd.promise();
    },
    $startup = $('#startup');
    /* END: var */
    
    $.when(fixJSON())
    .always(function() {
      $('#startup_platform').prop('checked', true);
      logger.info('require.JS: bootstrap complete');
      App.initialize();
    });
  });
