/*eslint-disable vars-on-top*/ // feature!es5
define(function (require) {
  'use strict';

  window.console.log('bic.js');

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

  // this module

  function start () {
    window.console.log('bic.js: start()');
    // AJAX Default Options
    $.ajaxPrefilter(function (options, originalOptions, jqXHR) {
      jqXHR.setRequestHeader('X-Blink-Config',
        JSON.stringify(window.BMP.BIC.siteVars));
    });

    require(['bic/router']);
  }

  // delay the app for Cordova if present
  whenBlinkGapReady.then(function () {
    start();
  });

  window.BMP.BIC = app;
  // keep BMP.BIC and BMP.BIC3 the same (for now, "BIC3" is deprecated)
  window.BMP.BIC3 = app;

  window.BMP.BIC.version = '3.8.0';

  return app; // export BMP.BIC
});
