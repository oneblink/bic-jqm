define(function (require) {
  'use strict';

  // local modules

  var c = require('bic/console');

  // this module

  return function (jqmData, bicData, next) {
    c.debug('Router.Middleware.whenPopulated()');
    bicData.app.whenPopulated()
      .then(function () {
        next(null, jqmData, bicData);
      })
      .catch(function (err) {
        next(err, jqmData, bicData);
      });
  };
});
