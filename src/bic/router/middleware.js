define(function (require) {
  'use strict';

  // foreign modules

  var GenericMiddleware = require('generic-middleware');

  // this module

  var Middleware = function Middleware () {
    GenericMiddleware.call(this);
  };

  Middleware.prototype = Object.create(GenericMiddleware.prototype);
  Middleware.prototype.constructor = Middleware;

  return Middleware;
});
