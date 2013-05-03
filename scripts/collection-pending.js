define(
  ['wrapper-backbone', 'model-pending-mobile'],
  function (Backbone, PendingItem) {
    "use strict";
    var PendingCollection = Backbone.Collection.extend({});
    var PendingCollection = Backbone.Collection.extend({
      model: PendingItem,

    });

    return PendingCollection;
  }
);