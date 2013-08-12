define(
  ['model-interaction', 'feature!data'],
  function (Interaction, Data) {
    "use strict";
    var InteractionCollection = Backbone.Collection.extend({

      model: Interaction,

      initialize: function () {
        var collection = this;
        collection.initialize = new $.Deferred();
        collection.data = new Data(window.BMP.siteVars.answerSpace + '-Interaction');
        collection.fetch({
          success: function () {
            collection.initialize.resolve();
          },
          error: function () {
            collection.initialize.reject();
          }
        });
        collection.on("reset", function () {
          collection.data.deleteAll();
        });
      },

      save: function () {
        _.each(this.models, function (model) {
          model.save();
        });
      },

      comparator: "order"

    });

    return InteractionCollection;
  }
);
