define(
  ['model-datasuitcase', 'feature!data'],
  function (DataSuitcase, Data) {
    'use strict';
    var DataSuitcaseCollection = Backbone.Collection.extend({
      model: DataSuitcase,

      datastore: function () {
        this.data = new Data(window.BMP.BIC.siteVars.answerSpace + '-DataSuitcase');
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

      save: function () {
        return Promise.all(_.map(this.models, function (model) {
          return new Promise(function (resolve, reject) {
            model.save({}, {
              success: resolve,
              error: reject
            });
          });
        }));
      }
    });
    return DataSuitcaseCollection;
  }
);
