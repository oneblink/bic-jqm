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

            templateData.content = _.map(app.formRecords.models, function (value) {
              var record = {};

              record.id = value.get("id");
              record.contents = [];

              _.each(value.attributes.list, function (iv, ik) {
                if (ik !== 'id' && ik !== '_id') {
                  record.contents.push(iv);
                }
              });

              return record;
            });

            templateData.headers = [];
            /*jslint unparam: true */
            _.each(app.formRecords.at(0).attributes.list, function (value, key) {
              if (key !== 'id' && key !== '_id') {
                templateData.headers.push(key);
              }
            });
            /*jslint unparam: false */

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




