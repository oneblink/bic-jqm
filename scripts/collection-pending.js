define(
  ['wrapper-backbone', 'model-pending-mobile'],
  function (Backbone, PendingItem) {
    "use strict";
    var PendingCollection = Backbone.Collection.extend({
      model: PendingItem,

      initialize: function () {
        // Event Bindings
        var collection = this;

        collection.on('add', function () {
          collection.sync("create", collection, {}).always(function (result) {
            collection.reset(result);
          });
        }, this);

        this.on('change', function () {
          collection.sync("create", collection, {}).always(function (result) {
            collection.reset(result);
          });
        }, this);

        // Pull anything out of storage
        require(['model-application-mobile'], function (app) {
          collection.siteName = app.get('siteName');
          collection.siteName = app.get('siteName');
          collection.sync("read", collection, {}).always(function (result) {
            collection.reset(result);
          });
        });
      }
    });

    return PendingCollection;
  }
);