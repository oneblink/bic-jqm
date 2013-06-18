/*jslint browser:true, es5:true, indent:2, nomen:true*/
/*global requirejs, require, define, module*/
/*global $, cordova*/
define(
  ['wrapper-backbone', 'router', 'model-interaction',
    'view-interaction', 'domReady'],
  function (Backbone, router, InteractionModel, InteractionView, domReady) {
    "use strict";

    function initialRender() {
      require(['model-application'], function (app) {
        $.mobile.defaultPageTransition = app.get("defaultTransition");
        domReady(function () {
          $.mobile.changePage($.mobile.path.parseLocation().pathname, {
            changeHash: false,
            reloadPage: true,
            transition: 'fade'
          });
          $(document).on('pageshow', function () {
            $('#temp').remove();
          });
        });
      });
    }

    function start() {
      // AJAX Default Options
      $.ajaxPrefilter(function (options, originalOptions, jqXHR) {
        jqXHR.setRequestHeader('X-Blink-Config',
          JSON.stringify(window.BMP.siteVars));
      });

      require(['model-application'], function (app) {
        app.initialize.done(function () {
          BMP.FileInput.initialize();
          if (navigator.onLine) {
            app.populate().done(function () {
              initialRender();
            });
          } else {
            app.fetch({
              success: function (model, response, options) {
                initialRender();
              },
              error: function (model, response, options) {
                app.populate().done(function () {
                  initialRender();
                });
              }
            });
          }
        });

        // Now process the app start

      });
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
