define(
  ['wrapper-backbone', 'model-pending-mobile', 'data-pouch', 'underscore', 'api-php'],
  function (Backbone, PendingItem, Data, _, API) {
    "use strict";
    var PendingCollection = Backbone.Collection.extend({
      model: PendingItem,

      initialize: function () {
        var collection = this;
        collection.data = new Data(window.BMP.siteVars.answerSpace + '-Pending', "create", "setPendingItem", ["answerspaceid", "name", "action", "data"]);
        collection.fetch({
          success: function () {
            collection.trigger("initialize");
          },
          error: function () {
            collection.trigger("initialize");
          }
        });
      },

      processQueue: function () {
        _.each(this.where({status: "Pending"}), function (element, index, list) {
          API.setPendingItem(element.get('name'), element.get('action'), element.get('data')).done(
            function (data, textStatus, jqXHR) {
              element.destroy({wait: true});
            }
          );
        }, this);
      }
    });

    return PendingCollection;
  }
);