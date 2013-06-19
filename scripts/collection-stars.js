define(
  ['model-star', 'feature!data'],
  function (Star, Data) {
    "use strict";
    var FormCollection = Backbone.Collection.extend({
      model: Star,

      initialize: function () {
        var collection = this;
        collection.initialize = new $.Deferred();
        collection.data = new Data(window.BMP.siteVars.answerSpace + '-Star');
        collection.fetch({
          success: function () {
            collection.initialize.resolve();
          },
          error: function () {
            collection.initialize.reject();
          }
        });
      },

      clear: function (type) {
        _.each(this.where({type: type}), function (model) {
          model.destroy();
        });
      }
    });
    return FormCollection;
  }
);
