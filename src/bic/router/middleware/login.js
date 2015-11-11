define(function (require) {
  'use strict';

  // foreign modules
  var $ = require('jquery');
  var _ = require('underscore');

  // local modules

  var API = require('bic/api');

  // this module

  return function (jqmData, bicData, next) {
    var app = bicData.app;
    var loginInteraction;
    var path;
    var url;

    // loggin not required
    if (!app.has('loginAccess') || !app.get('loginAccess')) {
      next(null, jqmData, bicData);
    }

    if (app.has('loginAccess') && app.get('loginAccess') === true && app.has('loginPromptInteraction')) {
      API.getLoginStatus().then(function (loginData) {
        if (loginData.status !== 'LOGGED IN') {
          loginInteraction = app.interactions.findWhere({dbid: 'i' + app.get('loginPromptInteraction')});
          path = $.mobile.path.parseLocation().pathname;
          if (path.slice(-1) === '/') {
            path = path.slice(0, path.length - 1);
          }
          url = path;
          if (_.indexOf(path.split('/'), loginInteraction.id) < 0) {
            url = url + '/' + loginInteraction.id;
            bicData.stopRoute();
            return $.mobile.navigate(url);
          }
        }
        next(null, jqmData, bicData);
      })
      .fail(function (err) {
        next(err, jqmData, bicData);
      });
    }
  };
});
