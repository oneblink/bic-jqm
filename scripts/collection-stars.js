define(
  ['model-star', 'feature!data'],
  function (Star, Data) {
    "use strict";
    var FormCollection = Backbone.Collection.extend({
      model: Star,

      datastore: function () {
        this.data = new Data(window.BMP.BIC.siteVars.answerSpace + '-Star');
        return this;
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
