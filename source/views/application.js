define(
  ['jquery', 'backbone', 'mustache', 'text!templates/v3/application.html'],
  function ($, Backbone, Mustache, Template) {
    "use strict";
    var ApplicationView = Backbone.View.extend({
      el: "html",

      data: {
        Title: "BICv32",
        css: ""
      },

      render: function () {
        this.$el.html(Mustache.render(Template, this.data));
        return this;
      }
    });

    return new ApplicationView();
  }
);