define(
  ['text!template-category-list.mustache'],
  function (template) {
    "use strict";
    var HomeView = Backbone.View.extend({
      render: function (parentView, data) {
        Mustache.render(template, {
          models: parentView.model.get("interactionList"),
          path: data.dataUrl.substr(-1) === '/' ? data.dataUrl : data.dataUrl + '/'
        });
      }
    });

    return HomeView;
  }
);


