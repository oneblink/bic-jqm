define(
  ['model-star', 'feature!data'],
  function (Star, Data) {
    'use strict';
    var FormCollection = Backbone.Collection.extend({
      model: Star,

      datastore: function () {
        this.data = new Data(window.BMP.BIC.siteVars.answerSpace.toLowerCase() + '-Star');
        return this;
      },

      load: function () {
        var collection = this;

        return new Promise(function (resolve, reject) {
          collection.fetch({
            success: resolve,
            error: reject
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
