/*eslint-disable vars-on-top*/ // feature!es5
define(function (require) {
  'use strict';

  // foreign modules

  var $ = require('jquery');

  require('feature!es5');
  require('BlinkGap');
  require('BMP.Blobs');
  require('jquerymobile');

  window.BMP.Forms = require('BlinkForms');

  // local modules

  var app = require('bic/model/application');
  var whenBlinkGapReady = require('bic/promise-blinkgap');

  require('bic/auth');
  require('bic/backbone-fix');
  require('bic/debug-jquery');
  require('bic/fix-animation');

  // this module

  // delay the app for Cordova if present
  whenBlinkGapReady.then(function () {
    // AJAX Default Options
    $.ajaxPrefilter(function (options, originalOptions, jqXHR) {
      jqXHR.setRequestHeader('X-Blink-Config',
        JSON.stringify(window.BMP.BIC.siteVars));
    });

    require(['bic/router']);
  });

  window.BMP.BIC = app;
  // keep BMP.BIC and BMP.BIC3 the same (for now, "BIC3" is deprecated)
  window.BMP.BIC3 = app;

  window.BMP.BIC.version = '3.8.2';

  window.BMP.console = require('bic/console');

  return app; // export BMP.BIC
});
