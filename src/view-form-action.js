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
            var formRecord
              , pendingModel;

            BlinkForms.initialize(definition, view.model.get('blinkFormAction'));
            view.$el.append(BlinkForms.current.$form);
            view.subView = new FormControls({
              model: view.model
            });
            view.subView.render();
            view.$el.append(view.subView.$el);

            if (view.model.getArgument('id')) {
              formRecord = app.formRecords.get(view.model.get('blinkFormObjectName') + '-' + view.model.get('args')['args[id]']);
              formRecord.populate(view.model.get('blinkFormAction'), function () {
                BlinkForms.current.setRecord(formRecord.get('record'));
                view.trigger('render');
              });
            } else if (view.model.getArgument('pid')) {
              pendingModel = app.pending.get(view.model.getArgument('pid'));

              if ( !pendingModel ){
                view.model.setArgument('pid', null);
                return view.trigger('render');
              }

              BlinkForms.current.setRecord(pendingModel.get('data'));
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
