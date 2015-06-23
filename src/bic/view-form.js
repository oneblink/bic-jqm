define(function (require) {
  'use strict';

  // foreign modules

  var $ = require('jquery');
  var Backbone = require('backbone');

  // local modules

  var FormAction = require('bic/view-form-action');
  var FormList = require('bic/view-form-list');

  // this module

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
});
