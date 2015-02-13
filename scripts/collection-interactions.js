define(
  ['model-interaction', 'feature!data'],
  function (Interaction, Data) {
    'use strict';
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

      save: function () {
        return Promise.all(_.map(this.models, function (model) {
          return new Promise(function (resolve, reject) {
            model.save({}, {
              success: resolve,
              error: reject
            });
          });
        }));
      },

      comparator: 'order'

    });

    return InteractionCollection;
  }
);
