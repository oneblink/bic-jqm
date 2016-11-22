define(function (require) {
  'use strict';

  // local modules

  var c = require('bic/console');

  // this module

  return function (jqmData, bicData, next) {
    var view = bicData.view;

    c.debug('Router.Middleware.resolve()', jqmData.url);

    // http://api.jquerymobile.com/1.3/pagebeforeload/
    // data.deferred.resolve|reject is expected after data.preventDefault()
    jqmData.deferred.resolve(jqmData.url, jqmData.options, view.$el);
    next(null, jqmData, bicData);
  };
});
