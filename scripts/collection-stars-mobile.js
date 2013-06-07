define(
  ['wrapper-backbone', 'model-star-mobile', 'feature!data'],
  function (Backbone, Star, Data) {
    "use strict";
    var FormCollection = Backbone.Collection.extend({
      model: Star,

      initialize: function () {
        var collection = this;
        collection.data = new Data(window.BMP.siteVars.answerSpace + '-Star');
        collection.fetch({
          success: function () {
            collection.trigger("initialize");
          },
          error: function () {
            collection.trigger("initialize");
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
