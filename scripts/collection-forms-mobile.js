define(
  ['wrapper-backbone', 'model-form-mobile', 'BlinkForms', 'jquery', 'underscore'],
  function (Backbone, Form, BlinkForms, $, _) {
    "use strict";
    var FormCollection = Backbone.Collection.extend({
      model: Form
    });
    return FormCollection;
  }
);
