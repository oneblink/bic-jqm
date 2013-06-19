define(
  ['model-pending', 'feature!data', 'api'],
  function (PendingItem, Data, API) {
    "use strict";
    var PendingCollection = Backbone.Collection.extend({
      model: PendingItem,

      initialize: function () {
        var collection = this;
        collection.initialize = new $.Deferred();
        collection.data = new Data(window.BMP.siteVars.answerSpace + '-Pending');
        collection.fetch({
          success: function () {
            collection.initialize.resolve();
          },
          error: function () {
            collection.initialize.reject();
          }
        });
      },

      processQueue: function () {
        _.each(this.where({status: "Pending"}), function (element) {
          API.setPendingItem(element.get('name'), element.get('action'), element.get('data')).done(
            function () {
              element.destroy({wait: true});
            }
          );
        }, this);
      }
    });

    return PendingCollection;
  }
);