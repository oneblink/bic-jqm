define(
  ['jquery', 'wrapper-backbone', 'mustache', 'text!template-interaction.mustache', 'text!template-inputPrompt.mustache', 'text!template-form.mustache', 'model-application-mobile', 'underscore', 'BlinkForms', 'jquerymobile'],
  function ($, Backbone, Mustache, Template, inputPromptTemplate, formTemplate, app, _, BlinkForms) {
    "use strict";
    var StarView = Backbone.View.extend({
      events: {}
    });

    return StarView;
  }
);