define(function (require) {
  'use strict';

  // foreign modules

  var Backbone = require('backbone');
  var Forms = require('BlinkForms');
  var $ = require('jquery');

  // local modules

  var app = require('bic/model/application');
  var FormControls = require('bic/view/form/controls');
  var FormErrorSummary = require('bic/view/form/error-summary-list');

  // this module

  var FormActionView = Backbone.View.extend({
    id: 'ActiveFormContainer',

    errorSummary: null,
    subView: null,

    initialize: function(){
      this.model.on('showErrors', this.renderErrorSummary, this);
      this.$errorSummaryContainer = $('<div class="bm_errorsummary--container"></div>');
    },

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
          //insert error summary above the form controls
          this.$errorSummaryContainer.append( this.errorSummary.render().$el );
          if ( this.errorSummary.enhance ){
            this.errorSummary.enhance();
          }

          return this.errorSummary;
        }

        this.errorSummary.render();
        if ( this.errorSummary.enhance ){
          this.errorSummary.enhance();
        }
        return this;
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
          view.$el.append(view.$errorSummaryContainer);
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

            Forms.current.setRecord(pendingModel.get('data')).then(function(){
              var errors = pendingModel.get('errors');
              if ( errors && errors.errors ){
                Forms.current.setErrors(errors.errors);
              }
            });
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
