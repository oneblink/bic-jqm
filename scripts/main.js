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
  ['wrapper-backbone', 'router-mobile', 'model-interaction-mobile', 'view-interaction-mobile', 'model-application-mobile', 'jquery', 'jquerymobile'],
  function (Backbone, router, InteractionModel, InteractionView, app, $) {
    "use strict";
    function start() {
      // Now process the app start
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
    }

    // Delay the app for Cordova
    function init() {
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
    }
    init();
  }
);