define(
  ['wrapper-backbone', 'model-interaction-mobile', 'feature!data'],
  function (Backbone, Interaction, Data) {
    "use strict";
    var InteractionCollection = Backbone.Collection.extend({

      model: Interaction,

      initialize: function () {
        var collection = this;
        collection.initalize = new $.Deferred();
        collection.data = new Data(window.BMP.siteVars.answerSpace + '-Interaction');
        collection.fetch({
          success: function () {
            collection.initalize.resolve();
          },
          error: function () {
            collection.initalize.reject();
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