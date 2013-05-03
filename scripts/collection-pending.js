define(
  ['wrapper-backbone', 'model-pending-mobile'],
  function (Backbone, PendingItem) {
    "use strict";
    var PendingCollection = Backbone.Collection.extend({
      model: PendingItem,

      initialize: function () {
        var collection = this;
        collection.on('add', function () {
          collection.sync("create", collection, {}).then(function () {
            collection.fetch({reset: true}).fail(function () {
              // Kinda dodgy implementation detail here
              // Ideally, the data layer would not throw an instant error
              // But instead return the actual state of the pending queue
              collection.remove(collection.where({status: 'Pending'}));
            });
          });
        }, this);

        this.on('change', function () {
          this.sync("update", this, {}).then(function () {
            this.fetch({reset: true});
          });
        }, this);
      }
    });

    return PendingCollection;
  }
);
