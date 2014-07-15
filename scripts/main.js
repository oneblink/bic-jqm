/*jslint browser:true, indent:2, nomen:true*/
/*global requirejs, require, define, module*/
/*global $, cordova*/
/*jslint sub:true*/ // we need to use obj['prop'] instead of obj.prop for IE8
define(
  [],
  function () {
    "use strict";

    function start() {
      // AJAX Default Options
      /*jslint unparam: true*/
      $.ajaxPrefilter(function (options, originalOptions, jqXHR) {
        jqXHR.setRequestHeader('X-Blink-Config',
          JSON.stringify(window.BMP.BIC.siteVars));
      });
      /*jslint unparam: false*/

      require(['router']);
    }

    // Delay the app for Cordova
    function init() {
      if (window.BMP.isBlinkGap === true) {
        if (cordova.available === true) {
          start();
        } else {
          // Poll
          window.setTimeout(init(), 1000);
        }
      } else {
        start();
      }
    }

    init();
  }
);
