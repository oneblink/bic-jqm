/*jslint browser:true, es5:true, indent:2, nomen:true*/
/*global requirejs, require, define, module*/
/*global $, cordova*/
requirejs.config({
  shim: {
    'underscore': {
      exports: '_'
    },
    'backbone': {
      deps: ['underscore', 'jquery'],
      exports: 'Backbone'
    },
    'BlinkForms': {
      exports: 'BlinkForms'
    },
    'pouchdb': {
      exports: 'Pouch'
    }
  }
});

define(
  ['wrapper-backbone', 'router-mobile', 'model-interaction-mobile',
    'view-interaction-mobile', 'domReady'],
  function (Backbone, router, InteractionModel, InteractionView, domReady) {
    "use strict";

    function initialRender() {
      require(['model-application-mobile'], function (app) {
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

      require(['model-application-mobile'], function (app) {
        app.once('initialize', function () {
          if (navigator.onLine) {
            app.populate().done(function () {
              initialRender();
            });
          } else {
            app.set({_id: window.BMP.siteVars.answerSpace}).fetch({
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
