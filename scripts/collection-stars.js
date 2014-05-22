define(
  ['model-star', 'feature!data'],
  function (Star, Data) {
    "use strict";
    var FormCollection = Backbone.Collection.extend({
      model: Star,

      initialize: function () {
        var collection = this;
        collection.data = new Data(window.BMP.BIC.siteVars.answerSpace + '-Star');
        collection.initialize = new Promise(function (resolve, reject) {
          collection.fetch({
            success: function () {
              resolve();
            },
            error: function () {
              reject();
            }
          });
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
