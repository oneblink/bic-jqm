define(function (require) {
  'use strict';

  // local modules

  var Collection = require('bic/collection');
  var Interaction = require('bic/model-interaction');

  // this module

  var NAME = window.BMP.BIC.siteVars.answerSpace.toLowerCase() + '-Interaction';

  var InteractionCollection = Collection.extend({

    model: Interaction,

    datastore: function () {
      return Collection.prototype.datastore.call(this, NAME);
    },

    comparator: 'order'

  });

  return InteractionCollection;
});
