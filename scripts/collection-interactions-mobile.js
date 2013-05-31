define(
  ['wrapper-backbone', 'model-interaction-mobile', 'data-pouch'],
  function (Backbone, Interaction, Data) {
    "use strict";
    var InteractionCollection = Backbone.Collection.extend({

      model: Interaction,

      initialize: function () {
        var collection = this;
        collection.data = new Data(window.BMP.siteVars.answerSpace + '-Interaction');
        collection.fetch({
          success: function () {
            collection.trigger("initialize");
          },
          error: function () {
            collection.trigger("initialize");
          }
        });
      },

      save: function () {
        _.each(this.models, function (model, key, list) {
          model.save();
        });
      }

    });

    return InteractionCollection;
  }
);