/*global cordova: true*/
requirejs.config({
  baseUrl: '/_BICv3_/scripts',
  paths: {
    BlinkForms: ['/_BICv3_/js/BlinkForms-jQueryMobile.min'],
    pouchdb: ['/_BICv3_/js/pouchdb-nightly']
  },
  shim: {
    'BlinkForms': {
      exports: 'BlinkForms'
    },
    'pouchdb': {
      exports: 'Pouch'
    }
  }
});

define(
  ['wrapper-backbone', 'router-mobile', 'model-interaction-mobile', 'view-interaction-mobile', 'jquery', 'jquerymobile'],
  function (Backbone, router, InteractionModel, InteractionView, $) {
    "use strict";

    function initialRender() {
      require(['domReady', 'model-application-mobile'], function (domReady, app) {
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
        jqXHR.setRequestHeader('X-Blink-Config', JSON.stringify(window.BMP.siteVars));
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