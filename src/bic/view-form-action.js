define(function (require) {
  'use strict';

  // foreign modules

  var Backbone = require('backbone');
  var Forms = require('BlinkForms');

  // local modules

  var app = require('bic/model-application');
  var FormControls = require('bic/view-form-controls');
  var FormErrorSummary = require('bic/view-form-error-summary-list-view');

  // this module

  var FormActionView = Backbone.View.extend({
    id: 'ActiveFormContainer',

    errorSummary: null,
    subView: null,

    /**
     * renders the Error summary, if it is turned on.
     * @return {Backbone.View} The Error summary view that was rendered
     */
    renderErrorSummary: function(){
      var ErrorView;
      if ( app.get('displayErrorSummary') && Forms.current.getInvalidElements ){
        if ( !this.errorSummary ){
          ErrorView = FormActionView.prepareErrorSummary();
          this.errorSummary = new ErrorView( { model: Forms.current } );
          this.$el.append( this.errorSummary.render().$el );

          return this.errorSummary;
        }

        return this.errorSummary.render();
      }
    },

    renderControls: function(){
        var SubView;

        if ( !this.subView){
          SubView = FormActionView.prepareSubView();

          this.subView = new SubView({
            model: this.model
          });
        }

        this.subView.render();
        this.$el.append(this.subView.$el);
    },

    render: function () {
      var view = this;

      Forms.getDefinition(view.model.get('blinkFormObjectName'), view.model.get('blinkFormAction'))
        .then(function (definition) {
          var formRecord;
          var pendingModel;

          Forms.initialize(definition, view.model.get('blinkFormAction'));
          view.$el.append(Forms.current.$form);

          view.renderErrorSummary();
          view.renderControls();

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
  }, {
    prepareSubView: function () {
      var SubView = FormControls;

      if (app.views.FormControls) {
        SubView = app.views.FormControls;
      }
      return SubView;
    },

    prepareErrorSummary: function(){
      return app.views.FormErrorSummary ? app.views.FormErrorSummary : FormErrorSummary;
    }
  });

  return FormActionView;
});
