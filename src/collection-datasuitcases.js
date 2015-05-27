define(
  ['model-datasuitcase', 'collection'],
  function (DataSuitcase, Collection) {
    'use strict';

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
  }
);
