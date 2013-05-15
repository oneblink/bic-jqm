define(
  ['wrapper-backbone', 'model-datasuitcase-mobile', 'data-pouch'],
  function (Backbone, DataSuitcase, Data) {
    "use strict";
    var DataSuitcaseCollection = Backbone.Collection.extend({
      model: DataSuitcase,

      initialize: function () {
        var collection = this;
        collection.data = new Data(window.BMP.siteVars.answerSpace + '-DataSuitcase', "update", "getDataSuitcase", [window.BMP.siteVars.answerSpace, "_id"]);
        collection.fetch({
          success: function () {
            collection.trigger("initialize");
          },
          error: function () {
            collection.trigger("initialize");
          }
        });
      }
    });
    return DataSuitcaseCollection;
  }
);
