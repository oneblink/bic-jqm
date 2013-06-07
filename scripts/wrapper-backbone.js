define(
  ['feature!data'],
  function (data) {
    "use strict";

    // Save traditional sync method as ajaxSync
    Backbone.ajaxSync = Backbone.sync;

    // Fallback to traditional sync when not specified
    Backbone.getSyncMethod = function (model) {
      if (model.data || (model.collection && model.collection.data)) {
        return Backbone.dataSync;
      } else {
        return Backbone.ajaxSync;
      }
    };

    Backbone.dataSync = function (method, model, options) {
      var data, dfrd, promise, persist;
      data = model.data || model.collection.data;
      dfrd = new $.Deferred();
      promise = dfrd.promise();

      // persist = function () {
      switch (method) {
      case "read":
        //promise = model.id !== undefined ? data.read(model) : data.readAll();
        promise = model.id !== undefined ? data.read(model) : data.readAll();
        break;
      case "create":
        promise = data.create(model);
        break;
      case "update":
        promise = data.update(model);
        break;
      case "patch":
        promise = data.update(model);
        break;
      case "delete":
        promise = data.delete(model);
        break;
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

        // return promise;
      // };

      // if (data.apiTrigger && data.apiTrigger === method) {
      //   data.read(model).then(function (response) {
      //     model.set(response, options);
      //     data.apiRequest(model).then(function (resp) {
      //       model.set(model.parse(resp, options), options);
      //       persist();
      //     });
      //   }, function (err) {
      //     data.apiRequest(model).then(function (resp) {
      //       model.set(model.parse(resp, options), options);
      //       persist();
      //     });
      //   });
      // } else {
      //   persist();
      // }

      return promise;
    };

    // Hook Backbone.sync up to the data layer
    Backbone.sync = function (method, model, options) {
      return Backbone.getSyncMethod(model).apply(this, [method, model, options]);
    };

    return Backbone;
  }
);

        // if (this.db === false) {
        //   // No DB mode
        //   promise = new $.Deferred().resolve().promise();
        // } else {
        //   // DB mode
        //   promise = new $.Deferred().resolve().promise();
        // }