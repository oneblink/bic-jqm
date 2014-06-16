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
              var arr = [];

              _.each(value.attributes, function (iv, ik) {
                if (ik !== 'id' && ik !== '_id') {
                  arr.push(iv);
                }
              });

              return arr;
            });

            templateData.headers = [];
            _.each(app.formRecords.at(0).attributes, function (value, key) {
              if (key !== 'id' && key !== '_id') {
                templateData.headers.push(key);
              }
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




