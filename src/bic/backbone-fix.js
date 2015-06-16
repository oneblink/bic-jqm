define(function (require) {
  'use strict';

  // foreign modules

  var Backbone = require('backbone');
  var Promise = require('feature!promises');

  // this module

  // Save traditional sync method as ajaxSync
  Backbone.oldSync = Backbone.sync;
  Backbone.ajaxSync = function (method, model, options) {
    if (!model || !model.url || options && !options.url) {
      if (window.console && window.console.warn) {
        window.console.warn(new TypeError('Backbone.sync() (via AJAX) was called, but model has no URL'));
      }
      if (options && typeof options.success === 'function') {
        options.success();
      }
      return null;
    }
    return Backbone.oldSync(method, model, options);
  };

  // New sync method
  Backbone.dataSync = function (method, model, options) {
    var data, promise;
    data = model.data || model.collection.data;

    switch (method) {
    case 'read':
      promise = model.id !== undefined ? data.read(model) : data.readAll();
      break;
    case 'create':
      promise = data.create(model);
      break;
    case 'update':
      promise = data.update(model);
      break;
    case 'patch':
      promise = data.update(model);
      break;
    case 'delete':
      promise = data.delete(model);
      break;
    default:
      promise = Promise.reject(new Error('unknown method'));
    }

    promise.then(function (response) {
      if (options.success) {
        options.success(response);
      }
    }, function (response) {
      if (options.error) {
        options.error(response);
      }
    });

    model.trigger('request', model, promise, options);

    return promise;
  };

  // Fallback to traditional sync when not specified
  Backbone.getSyncMethod = function (model) {
    if (model.data || model.collection && model.collection.data) {
      return Backbone.dataSync;
    }
    return Backbone.ajaxSync;
  };

  Backbone.sync = function (method, model) {
    // Hook Backbone.sync up to the data layer
    return Backbone.getSyncMethod(model).apply(this, arguments);
  };

});
