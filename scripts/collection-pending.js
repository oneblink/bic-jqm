define(
  ['wrapper-backbone', 'model-pending-mobile'],
  function (Backbone, PendingItem) {
    "use strict";
    var PendingCollection = Backbone.Collection.extend({});

    return PendingCollection;
  }
);