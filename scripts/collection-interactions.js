define(
  ['model-interaction', 'feature!data'],
  function (Interaction, Data) {
    "use strict";
    var InteractionCollection = Backbone.Collection.extend({

      model: Interaction,

      initialize: function () {
        var collection = this;
        collection.data = new Data(window.BMP.BIC.siteVars.answerSpace + '-Interaction');
        collection.initialize = new Promise(function (resolve, reject) {
          collection.fetch({
            success: function () {
              resolve();
            },
            error: function () {
              reject();
            }
          });
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
