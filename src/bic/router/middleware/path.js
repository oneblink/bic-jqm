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

    if (window.BMP.BlinkGap.isOfflineReady() && path.hrefNoSearch.indexOf(window.cordova.offline.filePathPrex) !== -1) {
      // Remove file path
      path.pathname = path.hrefNoSearch.substr(path.hrefNoSearch.indexOf(window.cordova.offline.filePathPrex) + window.cordova.offline.filePathPrex.length + 1);
      // Remove domain info
      path.pathname = path.pathname.substr(path.pathname.indexOf('/'));
      // Remove file suffix
      path.pathname = path.pathname.substr(0, path.pathname.indexOf('.'));
    }

    next(null, jqmData, bicData);
  };
});
