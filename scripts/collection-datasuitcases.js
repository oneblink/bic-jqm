define(
  ['model-datasuitcase', 'feature!data'],
  function (DataSuitcase, Data) {
    "use strict";
    var DataSuitcaseCollection = Backbone.Collection.extend({
      model: DataSuitcase,

      datastore: function () {
        this.data = new Data(window.BMP.BIC.siteVars.answerSpace + '-DataSuitcase');
        return this;
      },

      events: function () {
        var collection = this;

        collection.on("reset", function () {
          collection.data.deleteAll();
        });

        return this;
      }
    });
    return DataSuitcaseCollection;
  }
);
