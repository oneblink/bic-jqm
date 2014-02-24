define(
  ['text!template-inputPrompt.mustache'],
  function (template) {
    "use strict";
    var PromptView = Backbone.View.extend({
      render: function (parentView) {
        var rawform = parentView.model.get("inputPrompt");
        if (rawform.substr(0, 6) === "<form>") {
          return rawform;
        }
        return Mustache.render(template, {inputs: rawform});
      }
    });

    return PromptView;
  }
);

