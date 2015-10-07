define(function (require) {
  'use strict';

  // local modules

  var c = require('bic/console');

  // this module

  return function (jqmData, bicData, next) {
    var app = bicData.app;
    var model = bicData.model;

    if (!app.get('loginAccess') || 'i' + app.get('loginPromptInteraction') !== model.get('dbid')) {
      next(null, jqmData, bicData);
    }

    c.debug('Router.Middleware.postLogin()');

    app.checkLoginStatus()
      .then(function (data) {
        // `data` is only present if login status changed
        if (!data) {
          c.log('Router.Middleware.postLogin()', 'next()');
          next(null, jqmData, bicData);
          return;
        }

        if (app.get('loginToDefaultScreen')) {
          c.log('Router.Middleware.postLogin()', 'loginToDefaultScreen');
          bicData.stopRoute();
          app.goToInteraction();
        } else {
          c.log('Router.Middleware.postLogin()', '!loginToDefaultScreen');
          bicData.stopRoute();
          app.goToInteraction(jqmData.dataUrl);
        }
      })
      .catch(function (err) {
        next(err, jqmData, bicData);
      });
  };
});
