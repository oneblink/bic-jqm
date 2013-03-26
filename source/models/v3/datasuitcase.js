define(
  ['data/data'],
  function (Backbone) {
    "use strict";
    var DataSuitcase = Backbone.Model.extend({
      idAttribute: "_id"
    });
    return DataSuitcase;
  }
);
