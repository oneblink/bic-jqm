define(
  ['text!template-form-list.mustache', 'model-application'],
  function (Template, app) {
    "use strict";
    var FormListView = Backbone.View.extend({
      render: function () {
        var view = this;

        app.formRecords.pull(view.model.get("blinkFormObjectName")).then(
          function () {
            var templateData = {};
            templateData.headers = [];
            BlinkForms.getDefinition(view.model.get("blinkFormObjectName"), view.model.get("blinkFormAction")).then(function (definition) {
              var elements = [];
              /*jslint unparam: true */
              _.each(definition._elements, function (value, ik) {
                if (value.type !== 'subForm') {
                  elements.push(value.name);
                  templateData.headers.push(value.name);
                }
              });
              /*jslint unparam: false */

              templateData.content = _.map(app.formRecords.models, function (value) {
                var record = {};

                record.id = value.get("id");
                record.contents = [];

                _.each(value.attributes.list, function (iv, ik) {
                  if (ik !== 'id' && ik !== '_id' && _.contains(elements, ik)) {
                    record.contents.push(iv);
                  }
                });

                return record;
              });

              templateData.interactions = {};
              templateData.interactions.edit = app.interactions.findWhere({
                blinkFormObjectName: view.model.get("blinkFormObjectName"),
                blinkFormAction: "edit"
              }).id;
              templateData.interactions.view = app.interactions.findWhere({
                blinkFormObjectName: view.model.get("blinkFormObjectName"),
                blinkFormAction: "view"
              }).id;
              templateData.interactions['delete'] = app.interactions.findWhere({
                blinkFormObjectName: view.model.get("blinkFormObjectName"),
                blinkFormAction: "delete"
              }).id;

              view.$el.html(Mustache.render(Template, templateData));
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
    });

    return FormListView;
  }
);
