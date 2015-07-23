define(function (require) {
  'use strict';

  // foreign modules

  var $ = require('jquery');
  var Backbone = require('backbone');

  // local modules

  var app = require('bic/model/application');
  var FormAction = require('bic/view/form/action');
  var FormList = require('bic/view/form/list');

  // this module

  var FormView = Backbone.View.extend({
    render: function () {
      var view, action, SubView;

      view = this;
      action = view.model.get('blinkFormAction');

      if (action === 'list') {
        SubView = view.constructor.prepareSubView();
        view.subView = new SubView({
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
  }, {
    prepareSubView: function () {
      var SubView = FormList;

      if (app.views.FormList) {
        SubView = app.views.FormList;
      }
      return SubView;
    }
  });

  return FormView;
});
