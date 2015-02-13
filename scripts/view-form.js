define(
  ['view-form-action', 'view-form-list'],
  function (FormAction, FormList) {
    'use strict';
    var FormView = Backbone.View.extend({
      render: function () {
        var view, action;

        view = this;
        action = view.model.get('blinkFormAction');

        if (action === 'list') {
          view.subView = new FormList({
            model: view.model
          });
        } else if (action === 'search') {
          view.subView = null;
        } else {
          if ($('#ActiveFormContainer').length > 0) {
            $('#ActiveFormContainer').attr('id', 'FormContainer');
          }
          view.subView = new FormAction({
            model: view.model
          });
        }

        view.listenToOnce(view.subView, 'render', function () {
          view.$el.append(view.subView.$el);
          view.trigger('render');
        });

        view.subView.render();

        return view;
      }
    });

    return FormView;
  }
);
