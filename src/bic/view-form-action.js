define(function (require) {
  'use strict';

  // foreign modules

  var Backbone = require('backbone');
  var Forms = require('BlinkForms');

  // local modules

  var app = require('bic/model-application');
  var FormControls = require('bic/view-form-controls');

  // this module

  var FormActionView = Backbone.View.extend({
    id: 'ActiveFormContainer',

    render: function () {
      var view = this;

      Forms.getDefinition(view.model.get('blinkFormObjectName'), view.model.get('blinkFormAction'))
        .then(function (definition) {
          var formRecord;
          var pendingModel;

          Forms.initialize(definition, view.model.get('blinkFormAction'));
          view.$el.append(Forms.current.$form);
          view.subView = new FormControls({
            model: view.model
          });
          view.subView.render();
          view.$el.append(view.subView.$el);

          if (view.model.getArgument('id')) {
            formRecord = app.formRecords.get(view.model.get('blinkFormObjectName') + '-' + view.model.get('args')['args[id]']);
            formRecord.populate(view.model.get('blinkFormAction'), function () {
              Forms.current.setRecord(formRecord.get('record'));
              view.trigger('render');
            });
          } else if (view.model.getArgument('pid')) {
            pendingModel = app.pending.get(view.model.getArgument('pid'));

            if (!pendingModel) {
              view.model.setArgument('pid', null);
              return view.trigger('render');
            }

            Forms.current.setRecord(pendingModel.get('data'));
            if (Forms.current.getErrors) {
              Forms.current.getErrors();
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
});
