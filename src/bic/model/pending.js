define(function (require) {
  'use strict';

  // foreign modules

  var Backbone = require('backbone');

  // local modules
  var MODEL_STATUS = require('bic/enum-model-status');
  var API = require('bic/api');

  // this module

  /**
   * PendingItem - A BlinkForm that is waiting to be sent to the server.
   * Is stored the users local persistant storage via pouchDB
   */
  var PendingItem = Backbone.Model.extend({
    idAttribute: '_id',

    /**
     * defaults
     * @type {Object}
     */
    defaults: {
      type: 'Form',
      status: MODEL_STATUS.PENDING,
      result: null,
      errors: null,
      name: '',
      action: '',
      data: null,
      answerspaceid: ''
    },

    /**
     * Sends a pending model to the server and then updates the in-memory model with
     * the status from the server
     * @return {Promise} Resolved on successful save, rejected if server returns errors
     */
    process: function () {
      var self = this;

      return new Promise(function (resolve, reject) {
        var processed = function (result) {
          // the listener for this is in view-form-controls.js:325
          // shows popup and then removes the model from the collection.
          self.trigger('processed', self);

          return result;
        };

        var onSuccess = function (data) {
          return self.save({
            status: MODEL_STATUS.SUBMITTED,
            result: data,
            errors: undefined // remove any errors for a previously saved pending model.
          }).then(processed)
            .then(resolve)
            .then(undefined, reject);
        };

        var onFailure = function (data, status, errorName) {
          var err = { message: errorName };
          if (status === 'error' && data.responseText) {
            try {
              err = JSON.parse(data.responseText);
            } catch (e) {
              /* eslint-disable no-unused-expressions */
              window.console && window.console.log('Pending model: unable to parse response from server');
              /* eslint-enable no-unused-expressions */
            }

            self.setErrors(err)
                .then(processed)
                .then(undefined, processed);
          }

          reject(new Error(err.message));
        };

        var apiResponse = API.setPendingItem(self.get('name'), self.get('action'), self.get('data'));
        apiResponse.then(onSuccess);
        apiResponse.fail(onFailure);
      });
    },

    /**
     * persist errors to the pending queue. Automatically sets the status of the
     * model to {@link MODEL_STATUS_ENUM MODEL_STATUS_ENUM.FAILED_VALIDATION}
     * @param {Object} errors - a BlinkForms Error object. See The error readme for details.
     */
    setErrors: function (errors) {
      if (errors.errors) {
        errors.errors = window.BMP.Forms.errorHelpers.fromBMP(errors.errors);
      }
      this.set({
        status: MODEL_STATUS.FAILED_VALIDATION,
        errors: errors
      });

      return this.save();
    }
  });

  return PendingItem;
});
