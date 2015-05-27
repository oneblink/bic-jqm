define(
  ['model-star', 'collection'],
  function (Star, Collection) {
    'use strict';

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
  }
);
