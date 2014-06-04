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

      load: function () {
        var collection = this;

        return new Promise(function (resolve, reject) {
          collection.fetch({
            success: resolve,
            error: reject
          });
        });
      },

      events: function () {
        var collection = this;

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
