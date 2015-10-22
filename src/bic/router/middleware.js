define(function (require) {
  'use strict';

  // foreign modules

  var _ = require('underscore');
  var GenericMiddleware = require('generic-middleware');

  // this module

  var Middleware = function Middleware () {
    GenericMiddleware.call(this);
  };

  Middleware.prototype = Object.create(GenericMiddleware.prototype);
  Middleware.prototype.constructor = Middleware;

  Middleware.prototype.toJSON = function () {
    return this._stack.map(function (mw) {
      var key = _.findKey(Middleware, function (fn) {
        return mw === fn;
      });
      return key || '[function]';
    });
  };

  _.extend(Middleware, {
    app: require('bic/router/middleware/app'),
    errorHandler: require('bic/router/middleware/errorHandler'),
    path: require('bic/router/middleware/path'),
    model: require('bic/router/middleware/model'),
    resolve: require('bic/router/middleware/resolve'),
    bootStatus: require('bic/router/middleware/bootStatus'),
    view: require('bic/router/middleware/view'),
    viewRender: require('bic/router/middleware/viewRender'),
    whenPopulated: require('bic/router/middleware/whenPopulated')
  });

  return Middleware;
});
