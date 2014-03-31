/*jslint browser:true, indent:2*/
/*global define, require*/ // Require.JS and AMD
// Temporary Fixes
// These will end up in Global Require (I hope...)

/*jslint regexp:true*/ // this regular expression has been double-checked
var rootPath = document.currentScript.src.replace(/\\/g, '/').replace(/\/[^\/]*$/, '');
/*jslint regexp:false*/

(function () {
  'use strict';
  var cloudfront, filesystem, paths, getPaths, scripts, s, script;

  cloudfront = '//d1c6dfkb81l78v.cloudfront.net/';
  filesystem = '/_c_/';

  // determine our current CDN based on how we referenced Require.JS
  scripts = document.getElementsByTagName('script');
  s = scripts.length;
  while (s > 0) {
    s -= 1;
    script = scripts[s];
    if (script.src && /\/blink\/require\/\d+\/require\.min\.js/.test(script.src)) {
      cloudfront = script.src.replace(/blink\/require\/\d+\/require\.min\.js[\w\.]*$/, '');
      break; // exit early
    }
  }

  if (location.protocol === 'file:') {
    cloudfront = cloudfront.replace(/^\/\//, 'https://');
  }

  getPaths = function (path) {
    var result;
    result = [
      cloudfront + path,
      filesystem + path
    ];
    return result;
  };

  // dynamically set paths and fall-back paths;
  paths = {
    BlinkForms: getPaths('blink/forms/3/1377493706402/forms3jqm.min'),
    'BMP.Blobs': getPaths('blink/blobs/1377493706402/bmp-blobs.min'),
    signaturepad: getPaths('signaturepad/2.3.0/jq.sig.min'),
    jquerymobile: getPaths('jquery.mobile/1.3.2/jquery.mobile-1.3.2.min'),
    jquery: getPaths('jquery/1.9.1/jquery.min'),
    backbone: getPaths('backbonejs/1.1.0/backbone-min'),
    lodash: getPaths('lodash/2.4.1/lodash.compat.min'),
    modernizr: getPaths('modernizr/2.7.1/modernizr.custom.26204.min'),
    mustache: getPaths('mustache/0.7.3/mustache.min'),
    q: getPaths('q/0.9.7/q.min'),
    rivets: getPaths('rivets/0.6.5/rivets.min'),
    underscore: getPaths('lodash/2.4.1/lodash.underscore.min'),
    formsdeps: rootPath + "/formsdeps.min"
  };
  require.config({ paths: paths });
}());

require.config({
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
    },
    backbone: {
      deps: ['underscore', 'jquery'],
      exports: 'Backbone'
    },
    modernizr: {
      exports: 'Modernizr'
    },
    underscore: {
      exports: '_'
    }
  },
  bundles: {
    'formsdeps': ['picker', 'picker.date', 'picker.time', 'moment']
  }
});
