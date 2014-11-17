define(
  ['model-application', 'view-form-controls'],
  function (app, FormControls) {
    "use strict";
    var FormActionView = Backbone.View.extend({
      id: 'ActiveFormContainer',

      render: function () {
        var view = this, subView;

        BlinkForms.getDefinition(view.model.get("blinkFormObjectName"), view.model.get("blinkFormAction"))
          .then(function (definition) {
            BlinkForms.initialize(definition, view.model.get("blinkFormAction"));
            view.$el.append(BlinkForms.current.$form);
            subView = new FormControls({
              model: view.model
            });
            subView.render();
            view.$el.append(subView.$el);

            if (view.model.get("args")['args[id]']) {
              var formRecord;
              formRecord = app.formRecords.get(view.model.get("blinkFormObjectName") + '-' + view.model.get("args")['args[id]']);
              formRecord.populate(view.model.get("blinkFormAction"), function () {
                BlinkForms.current.setRecord(formRecord.get('record'));
                view.trigger("render");
              });
            } else if (view.model.get("args")['args[pid]']) {
              BlinkForms.current.setRecord(app.pending.get(view.model.get("args")['args[pid]']).get("data"));
              if (BlinkForms.current.getErrors) {
                BlinkForms.current.getErrors()
              }
              view.trigger("render");
            } else {
              view.trigger("render");
            }
          })
          .then(null, function (err) {
            console.log(err);
          });

        return view;
      }
    });

    return FormActionView;
  }
);
