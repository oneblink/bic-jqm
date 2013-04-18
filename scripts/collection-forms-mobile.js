define(
  ['backbone', 'model-form-mobile'],
  function (Backbone, Form) {
    "use strict";
    var FormCollection = Backbone.Collection.extend({
      model: Form
    });
    return FormCollection;
  }
);
