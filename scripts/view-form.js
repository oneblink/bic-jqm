define(
  ['model-application', 'text!template-form.mustache'],
  function (app, template) {
    "use strict";
    var FormView = Backbone.View.extend({
      render: function (parentView) {
        Mustache.render(template);
        //if ($('#ActiveFormContainer').length > 0) {
          //$('#ActiveFormContainer').attr('id', 'FormContainer');
        //}
        var form = $('#ActiveFormContainer');
        if (parentView.model.get("blinkFormAction") === "add" ||
            parentView.model.get("blinkFormAction") === "edit" ||
            parentView.model.get("blinkFormAction") === "view" ||
            parentView.model.get("blinkFormAction") === "delete") {
          BlinkForms.getDefinition(parentView.model.get("blinkFormObjectName"), parentView.model.get("blinkFormAction")).then(function (definition) {
            var formPageCount;

            BlinkForms.initialize(definition);
            form.append(BlinkForms.current.$form);

            if (parentView.model.get("blinkFormAction") === "edit") {
              BlinkForms.current.setRecord(app.pending.get(parentView.model.get("args")['args[id]']).get("data"));
            }

            if (BlinkForms.current.get('pages').length > 1) {
              // Multi page form. Prepare counters and stuff
              formPageCount = parentView.$el.find('#FormPageCount');
              formPageCount.find('#currentPage').html(BlinkForms.current.get('pages').current.index() + 1);
              formPageCount.find('#totalPages').html(BlinkForms.current.get('pages').length);
              parentView.formPagingButtons();
              formPageCount.removeAttr('style');
            }

            parentView.trigger("render");
          });
        }
      }
    });

    return FormView;
  }
);

      nextFormPage: function () {
        var index = BlinkForms.current.get('pages').current.index();

        if (index < BlinkForms.current.get('pages').length - 1) {
          BlinkForms.current.get('pages').goto(index + 1);
          $('#currentPage').html(BlinkForms.current.get('pages').current.index() + 1);
        }

        this.formPagingButtons();
      },

      previousFormPage: function () {
        var index = BlinkForms.current.get('pages').current.index();

        if (index > 0) {
          BlinkForms.current.get('pages').goto(index - 1);
          $('#currentPage').html(BlinkForms.current.get('pages').current.index() + 1);
        }

        this.formPagingButtons();
      },

      formPagingButtons: function () {
        var previous = $('#previousFormPage'),
          next = $('#nextFormPage');

        if (BlinkForms.current.get('pages').current.index() === 0) {
          previous.addClass('ui-disabled');
        } else {
          previous.removeClass('ui-disabled');
        }

        if (BlinkForms.current.get('pages').current.index() === BlinkForms.current.get('pages').length - 1) {
          next.addClass('ui-disabled', '');
        } else {
          next.removeClass('ui-disabled');
        }
      },
