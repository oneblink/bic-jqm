define(function (require) {
  'use strict';

  // local modules

  var c = require('bic/console');

  // this module

  return function (jqmData, bicData, next) {
    c.debug('Router.Middleware.app()');
    require(['bic/model/application'], function (app) {
      bicData.app = app;
      next(null, jqmData, bicData);
    });
  };
});
