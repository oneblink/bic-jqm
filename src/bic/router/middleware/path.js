define(function (require) {
  'use strict';

  // foreign modules

  var $mobile = require('jquerymobile');

  // local modules

  var c = require('bic/console');

  // this module

  return function (jqmData, bicData, next) {
    var path;

    c.debug('Router.Middleware.path()... ' + jqmData.absUrl);

    path = $mobile.path.parseUrl(jqmData.absUrl);
    bicData.path = path;

    next(null, jqmData, bicData);
  };
});
