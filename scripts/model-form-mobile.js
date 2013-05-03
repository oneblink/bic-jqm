define(
  ['wrapper-backbone', 'BlinkForms', 'underscore', 'jquery', 'model-application-mobile'],
  function (Backbone, BlinkForms, _, $, app) {
    "use strict";
    var Form = Backbone.Model.extend({
      idAttribute: "_id"
    });

    return Form;
  }
);
