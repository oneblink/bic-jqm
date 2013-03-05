define(
  ['backbone', 'models/v3/datasuitcase'],
  function (Backbone, DataSuitcase) {
    "use strict";
    var DataSuitcaseCollection = Backbone.Collection.extend({
      model: DataSuitcase
    });
    return DataSuitcaseCollection;
  }
);
