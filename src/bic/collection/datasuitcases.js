define(function (require) {
  'use strict';

  // foreign modules

  var Promise = require('feature!promises');

  // local modules

  var Collection = require('bic/collection');
  var DataSuitcase = require('bic/model/datasuitcase');

  // this module

  var NAME = window.BMP.BIC.siteVars.answerSpace.toLowerCase() + '-DataSuitcase';

  var DataSuitcaseCollection = Collection.extend({
    model: DataSuitcase,

    datastore: function () {
      return Collection.prototype.datastore.call(this, NAME);
    },

    load: function () {
      // always resolve, never reject
      return Collection.prototype.load.call(this).then(null, function () {
        return Promise.resolve();
      });
    }

  });
  return DataSuitcaseCollection;
});
