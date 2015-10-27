define(function (require) {
  'use strict';

  // local modules

  var c = require('bic/console');
  var flag = false;
  // this module

  return function (jqmData, bicData, next) {
    c.debug('Router.Middleware.bootStatus()');

    if (window.BootStatus && window.BootStatus.notifySuccess && !flag) {
      flag = true;
      window.BootStatus.notifySuccess();
    }
    next(null, jqmData, bicData);
  };
});
