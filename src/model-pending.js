define(
  [],
  function () {
    'use strict';
    var PendingItem = Backbone.Model.extend({
      idAttribute: '_id'
    });

    return PendingItem;
  }
);
