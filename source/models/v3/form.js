define(
  ['data/data'],
  function (Backbone) {
    "use strict";
    var Form = Backbone.Model.extend({
      idAttribute: "_id"
    });
    return Form;
  }
);
