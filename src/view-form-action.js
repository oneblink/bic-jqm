define(
  ['model-application', 'view-form-controls'],
  function (app, FormControls) {
    'use strict';
    var FormActionView = Backbone.View.extend({
      id: 'ActiveFormContainer',

      render: function () {
        var view = this;

        BlinkForms.getDefinition(view.model.get('blinkFormObjectName'), view.model.get('blinkFormAction'))
          .then(function (definition) {
            var formRecord;

            BlinkForms.initialize(definition, view.model.get('blinkFormAction'));
            view.$el.append(BlinkForms.current.$form);
            view.subView = new FormControls({
              model: view.model
            });
            view.subView.render();
            view.$el.append(view.subView.$el);

            if (view.model.get('args')['args[id]']) {
              formRecord = app.formRecords.get(view.model.get('blinkFormObjectName') + '-' + view.model.get('args')['args[id]']);
              formRecord.populate(view.model.get('blinkFormAction'), function () {
                BlinkForms.current.setRecord(formRecord.get('record'));
                view.trigger('render');
              });
            } else if (view.model.get('args')['args[pid]']) {
              BlinkForms.current.setRecord(app.pending.get(view.model.get('args')['args[pid]']).get('data'));
              if (BlinkForms.current.getErrors) {
                BlinkForms.current.getErrors();
              }
              view.trigger('render');
            } else {
              view.trigger('render');
            }
          })
          .then(null, function (err) {
            view.$el.append('<p>Error: unable to display this form. Try again later.</p>');
            view.trigger('render');
            window.console.log(err);
          });

        return view;
      }
    });

    return FormActionView;
  }
);
