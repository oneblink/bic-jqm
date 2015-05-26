define(
  ['model-application', 'authentication', 'backbone-fix', 'promise-blinkgap'],
  function (app, Auth, fixBackbone, whenBlinkGapReady) {
    'use strict';

    function start () {
      // AJAX Default Options
      $.ajaxPrefilter(function (options, originalOptions, jqXHR) {
        jqXHR.setRequestHeader('X-Blink-Config',
          JSON.stringify(window.BMP.BIC.siteVars));
      });

      window.BMP.Authentication = new Auth();

      require(['router', 'auth']);
    }

    fixBackbone(app);

    // delay the app for Cordova if present
    whenBlinkGapReady.then(function () {
      start();
    });

    return app; // export BMP.BIC
  }
);
