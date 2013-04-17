/*global cordova: true*/
requirejs.config({
  baseUrl: '/_BICv3_/source',
  paths: {
    BlinkForms: ['/_BICv3_/assets/js/BlinkForms.min'],
    pouchdb: ['/_BICv3_/assets/js/pouchdb-nightly']
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
  ['backbone', 'router-mobile', 'model-interaction-mobile', 'view-interaction-mobile', 'model-application-mobile', 'jquery', 'jquerymobile'],
  function (Backbone, router, InteractionModel, InteractionView, app, $) {
    "use strict";
    var start = function () {
        var location = $.mobile.path.parseLocation();
        app.set({
          _id: location.pathname.substr(1).split('/')[0],
          siteName: location.pathname.substr(1).split('/')[0],
          BICtype: "AnswerSpace"
        }).fetch({success: function (model, response, options) {
          $.mobile.defaultPageTransition = model.get("defaultTransition");
          $.mobile.changePage(location.pathname, {
            changeHash: false,
            reloadPage: true,
            transition: 'fade'
          });
          $(document).on('pageshow', function () {
            $('#temp').remove();
          });
        }});
      },
      init = function () {
        if (window.NativeApp === true) {
          if (cordova.available === true) {
            start();
          } else {
            // Poll
            window.setTimeout(init(), 1000);
          }
        } else {
          start();
        }
      };
    init();
  }
);