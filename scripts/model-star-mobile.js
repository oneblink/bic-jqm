define(
  ['wrapper-backbone'],
  function (Backbone) {
    "use strict";
    var Star = Backbone.Model.extend({
      idAttribute: "_id"
    });

    return Star;
  }
);
