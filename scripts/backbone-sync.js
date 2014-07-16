define(
  [],
  function () {
    "use strict";

    Backbone.emulateHTTP = true;

    // Save traditional sync method as ajaxSync
    Backbone.ajaxSync = Backbone.sync;

    // New sync method
    Backbone.sync = function (method, model, options) {
      var success, error, data;

      if (!model.data && !model.collection.data) {
        if (options.error) {
          return options.error('No data store set on the model/collection');
        }
        return;
      }
      data = model.data || model.collection.data;

      options = options || {};
      success = options.success;
      error = options.error;

      model.trigger('request', model, null, options);

      switch (method) {
      case "read":
        // Read from data
        // Process network request
        // Update data
        // Return data
        if (model.httpMethod && method === model.httpMethod && method === "read" && navigator.onLine) {
          options.success = function (syncResponse) {
            options.success = function (ajaxResponse) {
              options.success = function (dataResponse) {
                success(dataResponse);
              };
              options.error = function () {
                error("Unable to update data store");
              };
              model.set(ajaxResponse);
              data.sync("update", ajaxResponse, options);
            };
            options.error = function () {
              error("Unable to fetch new data");
            };
            model.set(syncRespone);
            Backbone.ajaxSync(method, model, options);
          };
          options.error = function () {
            options.success = function (ajaxResponse) {
              options.success = function (dataResponse) {
                success(dataResponse);
              };
              options.error = function () {
                success(ajaxResponse);
              };
              model.set(ajaxResponse);
              data.sync("create", model, options);
            };
            options.error = function () {
              error('Could not retreive data');
            };
            Backbone.ajaxSync(method, model, options);
          };
          data.sync(method, model, options);
        } else {
          data.sync(method, model, options);
        }
        break;
      case "create":
        data.sync(method, model, options);
        break;
      case "update":
        data.sync(method, model, options);
        break;
      case "patch":
        data.sync(method, model, options);
        break;
      case "delete":
        data.sync(method, model, options);
        break;
      }

      return;
    };
  }
);
