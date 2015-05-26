define(
  ['model-application', 'authentication', 'backbone-fix'],
  function (app, Auth, fixBackbone) {
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

    if (window.BMP.BlinkGap.isHere()) {
      // Delay the app for Cordova
      window.BMP.BlinkGap.whenReady().then(start, start);
    } else {
      start();
    }

    return app; // export BMP.BIC
  }
);
