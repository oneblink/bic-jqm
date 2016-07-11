define(function (require) {
  'use strict';

  // foreign modules

  var Backbone = require('backbone');
  var Mustache = require('mustache');

  // local modules

  var Template = require('text!bic/template/form/list.mustache');
  var app = require('bic/model/application');

  // this module

  var extractNames = function (headers, element) {
    if (element.type !== 'subForm' && !(element.name === 'id' || element.name === '_id')) {
      headers.push(element.name);
    }

    return headers;
  };

  // extractValues (whitelist: String[]) => (formRecordModel: Backbone.Model) => Object
  var extractValues = function (whitelist) {
    whitelist = whitelist || [];

    return function (formRecordModel) {
      var listData = formRecordModel.get('list') || {}; // Object
      return {
        id: formRecordModel.get('id'),
        contents: whitelist.map(function (columnName) {
          return listData[columnName] || listData[columnName.toLowerCase()] || '';
        }, [])
      };
    };
  };

  var extractId = function (interaction) {
    return interaction.id;
  };

  var FormListView = Backbone.View.extend({
    render: function () {
      var view = this;
      var objectName = view.model.get('blinkFormObjectName');

      app.formRecords.pull(objectName).then(
        function () {
          window.BMP.Forms.getDefinition(objectName, view.model.get('blinkFormAction'))
            .then(function (definition) {
              var templateData = {
                headers: definition._elements.reduce(extractNames, []),
                interactions: app.interactions.getFormActions(objectName, extractId)
              };

              templateData.content = app.formRecords.map(extractValues(templateData.headers));
              templateData.hasContent = templateData.content.length > 0;

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
