define(
  ['model-interaction', 'collection'],
  function (Interaction, Collection) {
    'use strict';

    var NAME = window.BMP.BIC.siteVars.answerSpace.toLowerCase() + '-Interaction';

    var InteractionCollection = Collection.extend({

      model: Interaction,

      datastore: function () {
        return Collection.prototype.datastore.call(this, NAME);
      },

      comparator: 'order'

    });

    return InteractionCollection;
  }
);
