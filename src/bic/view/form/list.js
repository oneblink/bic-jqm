define(function (require) {
  'use strict';

  // foreign modules

  var _ = require('underscore');
  var Backbone = require('backbone');
  var Mustache = require('mustache');

  // local modules

  var Template = require('text!bic/template/form/list.mustache');
  var app = require('bic/model/application');

  // this module

  var FormListView = Backbone.View.extend({
    render: function () {
      var view = this;
      var objectName = view.model.get('blinkFormObjectName');

      app.formRecords.pull(objectName).then(
        function () {
          var BlinkForms = window.BMP.Forms;
          var templateData = {};

          templateData.headers = [];
          BlinkForms.getDefinition(objectName, view.model.get('blinkFormAction')).then(function (definition) {
            var elements = [];
            _.each(definition._elements, function (value) {
              if (value.type !== 'subForm') {
                elements.push(value.name);
                templateData.headers.push(value.name);
              }
            });

            templateData.content = _.map(app.formRecords.models, function (value) {
              var record = {};

              record.id = value.get('id');
              record.contents = [];

              _.each(value.attributes.list, function (iv, ik) {
                if (ik !== 'id' && ik !== '_id' && _.contains(elements, ik)) {
                  record.contents.push(iv);
                }
              });

              return record;
            });
            templateData.hasContent = templateData.content.length > 0;

            templateData.interactions = app.interactions.getFormActions(objectName, function (interaction) {
              return interaction.id;
            });

            view.$el.html(Mustache.render(view.constructor.template, templateData));
            view.trigger('render');
          });
        },
        function () {
          view.$el.html('Cannot contact server');
          view.trigger('render');
        }
     );

      return view;
    }
  }, {
    template: Template
  });

  return FormListView;
});
