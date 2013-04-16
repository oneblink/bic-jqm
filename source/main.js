/*global cordova: true*/
requirejs.config({
  baseUrl: '/_BICv3_/source',
  paths: {
    text: ['https://d1c6dfkb81l78v.cloudfront.net/requirejs/2.1.2/text'],
    jquery: ['https://d1c6dfkb81l78v.cloudfront.net/jquery/1.8.3/jq.min'],
    jquerymobile: ['https://d1c6dfkb81l78v.cloudfront.net/jquery.mobile/1.3.0/jqm.min'],
    underscore: ['https://d1c6dfkb81l78v.cloudfront.net/underscorejs/1.4.3/u.min'],
    backbone: ['https://d1c6dfkb81l78v.cloudfront.net/backbonejs/0.9.10/backbone.min'],
    mustache: ['https://d1c6dfkb81l78v.cloudfront.net/mustache/0.7.2/mustache.min'],
    BlinkForms: ['/_BICv3_/assets/js/BlinkForms.min'],
    rivets: ['https://d1c6dfkb81l78v.cloudfront.net/rivets/0.4.5/rivets.min'],
    q: ['https://d1c6dfkb81l78v.cloudfront.net/q/0.8.11/q.min'],
    pouchdb: ['/_BICv3_/assets/js/pouchdb-nightly']
  },
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
    'rivets': {
      exports: 'rivets'
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