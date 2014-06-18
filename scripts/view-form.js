define(
  ['view-form-action', 'view-form-list', 'view-form-search'],
  function (FormAction, FormList, FormSearch) {
    "use strict";
    var FormView = Backbone.View.extend({
      render: function () {
        var view, action, subView;

        view = this;
        action = view.model.get("blinkFormAction");

        if (action === "list") {
          subView = new FormList({
            model: view.model
          });
        } else if (action === "search") {
          subView = new FormSearch({
            model: view.model
          });
        } else {
          if ($('#ActiveFormContainer').length > 0) {
            $('#ActiveFormContainer').attr('id', 'FormContainer');
          }
          subView = new FormAction({
            model: view.model
          });
        }

        view.listenToOnce(subView, 'render', function () {
          view.$el.append(subView.$el);
          view.trigger('render');
        });

        subView.render();

        return view;
      }
    });

    return FormView;
  }
);


