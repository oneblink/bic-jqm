define(
  ['backbone', 'model-datasuitcase-mobile'],
  function (Backbone, DataSuitcase) {
    "use strict";
    var DataSuitcaseCollection = Backbone.Collection.extend({
      model: DataSuitcase
    });
    return DataSuitcaseCollection;
  }
);
