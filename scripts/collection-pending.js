define(
  ['model-pending', 'feature!data', 'api'],
  function (PendingItem, Data, API) {
    "use strict";
    var PendingCollection = Backbone.Collection.extend({
      model: PendingItem,

      initialize: function () {
        var collection = this;
        collection.initalize = new $.Deferred();
        collection.data = new Data(window.BMP.siteVars.answerSpace + '-Pending');
        collection.fetch({
          success: function () {
            collection.initalize.resolve();
          },
          error: function () {
            collection.initalize.reject();
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