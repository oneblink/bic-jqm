define(
  ['model-application', 'authentication'],
  function (app, Auth) {
    'use strict';

    function start() {
      // AJAX Default Options
      $.ajaxPrefilter(function (options, originalOptions, jqXHR) {
        jqXHR.setRequestHeader('X-Blink-Config',
          JSON.stringify(window.BMP.BIC.siteVars));
      });

      window.BMP.Authentication = new Auth();

      require(['router', 'auth']);
    }

    // Delay the app for Cordova
    function init() {
      if (window.BMP.BlinkGap.isHere()) {
        window.BMP.BlinkGap.whenReady().then(start, start);
      } else {
        start();
      }
    }

    // Save traditional sync method as ajaxSync
    Backbone.ajaxSync = Backbone.sync;

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

    // Hook Backbone.sync up to the data layer
    Backbone.sync = function (method, model, options) {
      return Backbone.getSyncMethod(model).apply(this, [method, model, options]);
    };

    init();

    return app; // export BMP.BIC
  }
);
