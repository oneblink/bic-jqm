define(
  ['model-application', 'text!template-category-list.mustache'],
  function (app, template) {
    "use strict";
    var CategoryView = Backbone.View.extend({
      render: function (parentView, data) {
        Mustache.render(template, {
          models: _.map(_.filter(app.interactions.models, function (value) {
            return value.get("display") !== "hide" && _.filter(value.get("tags"), function (element) {
              return element === 'nav-' + this.model.id.toLowerCase();
            }, this).length > 0;
          }, parentView), function (value) {
            return value.attributes;
          }),
          path: data.dataUrl.substr(-1) === '/' ? data.dataUrl : data.dataUrl + '/'
        });
      }
    });

    return CategoryView;
  }
);

