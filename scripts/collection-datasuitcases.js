define(
  ['model-datasuitcase', 'feature!data'],
  function (DataSuitcase, Data) {
    "use strict";
    var DataSuitcaseCollection = Backbone.Collection.extend({
      model: DataSuitcase,

      initialize: function () {
        var collection = this;
        collection.data = new Data(window.BMP.BIC.siteVars.answerSpace + '-DataSuitcase');
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

        collection.on("reset", function () {
          collection.data.deleteAll();
        });
      }
    });
    return DataSuitcaseCollection;
  }
);
