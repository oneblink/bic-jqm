define(
  ['model-interaction', 'feature!data'],
  function (Interaction, Data) {
    "use strict";
    var InteractionCollection = Backbone.Collection.extend({

      model: Interaction,

      datastore: function () {
        this.data = new Data(window.BMP.BIC.siteVars.answerSpace + '-Interaction');
        return this;
      },

      events: function () {
        var collection = this;

        collection.on("reset", function () {
          collection.data.deleteAll();
        });

        return this;
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
