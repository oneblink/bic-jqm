define(function (require) {
  'use strict';

  // foreign modules

  var _ = require('underscore');

  // local modules

  var MODEL_STATUS = require('bic/enum-model-status');

  var Collection = require('bic/collection');
  var PendingItem = require('bic/model/pending');

  // this module

  var NAME = window.BMP.BIC.siteVars.answerSpace.toLowerCase() + '-Pending';

  var onQueueProcessingError = function (err) {
    /* eslint-disable no-unused-expressions */
    window.console && window.console.log && window.console.log('There was an error processing the pending queue:', err);
    /* eslint-enable no-unused-expressions */

    return err;
  };

  var processModel = function (pendingFormModel) {
    return pendingFormModel.process();
  };

  var PendingCollection = Collection.extend({
    model: PendingItem,

    datastore: function () {
      return Collection.prototype.datastore.call(this, NAME);
    },

    processQueue: function (options) {
      // an options hash because I can see a need to batch pending queue
      // processing, and therefore will need some form of range options.
      var pendingModelStatus = MODEL_STATUS.PENDING;
      var pendingForms;
      var promises;

      if (options) {
        pendingModelStatus = options.status || pendingModelStatus;
      }

      pendingForms = this.where({ status: pendingModelStatus });
      promises = Promise.all(_.map(pendingForms, processModel));

      promises.then(undefined, onQueueProcessingError);

      return promises;
    },

    retryFailed: function () {
      return this.processQueue({ status: MODEL_STATUS.FAILED_VALIDATION });
    },

    /**
     * Gets all forms in the pending queue that have failed submission
     * @return {[type]} [description]
     */
    getFailedSubmissions: function () {
      return new PendingCollection(this.where({ status: MODEL_STATUS.FAILED_VALIDATION }));
    },

    /**
     * Helper method to get all pending forms by their name "Unique name" as
     * set in the BlinkForms Manager
     * @param  {string} name The unique name set in the BlinkForms definition
     * @return {PendingCollection} A new pending collection that is a subset of
     * the parent collection where every model has the given form name.
     */
    getByFormName: function (name) {
      return new PendingCollection(this.where({name: name}));
    }
  });

  return PendingCollection;
});
