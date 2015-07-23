define(function (require) {
  'use strict';

  // foreign modules

  var _ = require('underscore');
  var Promise = require('feature!promises');


  // local modules

  var MODEL_STATUS = require('bic/enum-model-status');

  var API = require('bic/api');
  var Collection = require('bic/collection');
  var PendingItem = require('bic/model/pending');

  // this module

  var NAME = window.BMP.BIC.siteVars.answerSpace.toLowerCase() + '-Pending';

  var PendingCollection = Collection.extend({
    model: PendingItem,

    datastore: function () {
      return Collection.prototype.datastore.call(this, NAME);
    },

    processQueue: function () {
      var promises, callback;
      promises = [];
      callback = function (element, innerCallback) {
        return function (data, status, xhr) {
          var errors;

          if (data && xhr.status === 200) {
            element.save({
              status: MODEL_STATUS.SUBMITTED,
              result: data
            });
          } else if (status === 'error' && data.responseText) {
            errors = JSON.parse(data.responseText);
            element.save({
              status: MODEL_STATUS.FAILED_VALIDATION,
              errors: errors
            });
          }
          element.trigger('processed');
          innerCallback();
        };
      };

      _.each(this.where({status: MODEL_STATUS.PENDING }), function (element) {
        promises.push(new Promise(function (resolve, reject) {
          API.setPendingItem(element.get('name'), element.get('action'), element.get('data')).then(
            callback(element, resolve),
            callback(element, reject)
          );
        }));
      }, this);

      return Promise.all(promises);
    }
  });

  return PendingCollection;
});
