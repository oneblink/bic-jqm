define(function (require) {
  'use strict';

  // foreign modules

  var _ = require('underscore');

  // local modules

  var Collection = require('bic/collection');
  var Star = require('bic/model-star');

  // this module

  var NAME = window.BMP.BIC.siteVars.answerSpace.toLowerCase() + '-Star';

  var FormCollection = Collection.extend({
    model: Star,

    datastore: function () {
      return Collection.prototype.datastore.call(this, NAME);
    },

    clear: function (type) {
      _.each(this.where({type: type}), function (model) {
        model.destroy();
      });
    }
  });
  return FormCollection;
});
