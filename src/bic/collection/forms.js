define(function (require) {
  'use strict';

  // foreign modules

  var _ = require('underscore');

  // local modules

  var API = require('bic/api');
  var Collection = require('bic/collection');
  var Form = require('bic/model/form');

  // this module

  var NAME = window.BMP.BIC.siteVars.answerSpace.toLowerCase() + '-Form';

  var FormCollection = Collection.extend({
    model: Form,

    datastore: function () {
      return Collection.prototype.datastore.call(this, NAME);
    },

    whenUpdated: function () {
      if (this.whenUpdated._promise) {
        return this.whenUpdated._promise;
      }

      this.whenUpdated._promise = this.download()
      .then(null, function () { return Promise.resolve(); });

      return this.whenUpdated._promise;
    },

    download: function () {
      var collection = this;

      if (!(navigator.onLine || window.BMP.BIC.isBlinkGap)) {
        return Promise.resolve();
      }

      return API.getForm().then(function (data) {
        _.each(data, function (recordData) {
          var record = JSON.parse(recordData);
          var preExisting = collection.findWhere({_id: record.default.name});
          if (preExisting) {
            preExisting.set(record).save();
          } else {
            record._id = record.default.name;
            collection.create(record);
          }
        });
      });
    }

  });
  return FormCollection;
});
