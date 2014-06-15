define(
  ['model-application', 'view-form-controls'],
  function (app, FormControls) {
    "use strict";
    var FormActionView = Backbone.View.extend({
      id: 'ActiveFormContainer',

      render: function () {
        var view = this, subView;

        BlinkForms.getDefinition(view.model.get("blinkFormObjectName"), view.model.get("blinkFormAction")).then(function (definition) {

          BlinkForms.initialize(definition);
          view.$el.append(BlinkForms.current.$form);

          if (view.model.get("blinkFormAction") === "edit") {
            BlinkForms.current.setRecord(app.pending.get(view.model.get("args")['args[id]']).get("data"));
          }

          subView = new FormControls({
            model: view.model
          });
          subView.render();
          view.$el.append(subView.$el);

          view.trigger("render");
        });

        return view;
      }
    });

    return FormActionView;
  }
);



