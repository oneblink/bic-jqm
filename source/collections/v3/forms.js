define(
  ['backbone', 'models/v3/form'],
  function (Backbone, Form) {
    "use strict";
    var FormCollection = Backbone.Collection.extend({
      model: Form
    });
    return FormCollection;
  }
);
