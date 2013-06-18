define(
  [],
  function () {
    "use strict";
    var Star = Backbone.Model.extend({
      idAttribute: "_id",

      initialize: function () {
        this.on('add', function () {
          this.save();
        }, this);
      },

      toggle: function () {
        var model = this;
        model.get("state") ? this.set("state", false) : this.set("state", true);
        require(['model-application'], function (app) {
          if (model.get("state")) {
            app.stars.add(model);
          } else {
            model.destroy();
          }
        });
      }
    });

    return Star;
  }
);
