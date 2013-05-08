define(
  ['backbone', 'jquery', 'data-pouch'],
  function (Backbone, $, data) {
    "use strict";

    // Hook Backbone.sync up to the data layer
    Backbone.sync = function (method, model, options) {
      options.dfrd = new $.Deferred();

      if (model instanceof Backbone.Model) {
        data.getModel(model, options);
      } else if (model instanceof Backbone.Collection && method === "read") {
        data.getModels(model, options);
      } else if (model instanceof Backbone.Collection && method === "create") {
        data.setModels(model, options);
      } else {
        options.dfrd.reject();
      }

      return options.dfrd.promise();
    };

    return Backbone;
  }
);