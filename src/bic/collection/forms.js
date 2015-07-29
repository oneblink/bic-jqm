define(function (require) {
  'use strict';

  // foreign modules

  var _ = require('underscore');
  var Forms = require('BlinkForms');
  var Promise = require('feature!promises');

  // local modules

  var API = require('bic/api');
  var Collection = require('bic/collection');
  var Form = require('bic/model/form');

  // this module

  var NAME = window.BMP.BIC.siteVars.answerSpace.toLowerCase() + '-Form';

  var FormCollection = Collection.extend({
    model: Form,

    initialize: function () {
      if (!Forms) {
        Forms = {};
      }

      // BlinkForms expects this function to be defined by whatever is using it.
      // otherwise, subforms will fall over.
      Forms.getDefinition = function (name, action) {
        var app = window.BMP.BIC;
        var formDefinition;

        return app.forms.whenUpdated()
        .then(function () {
          return new Promise(function (resolve, reject) {
            var def = app.forms.get(name);
            if (!def) {
              return reject(new Error('unable to locate "' + name + '" definition'));
            }

            try {
              formDefinition = Forms.flattenDefinition(def.attributes, action);
              // BlinkForms.flattenDefinition returns a non backbone object
              // so lets make sure that the leave interactions defined exist on it, so
              // BlinkForms will use them when creating the form model.
              if (def.get('onFormLeaveInteraction')) {
                formDefinition.onFormLeaveInteraction = def.get('onFormLeaveInteraction');
              }
              resolve(formDefinition);
            } catch (err) {
              reject(err);
            }
          });
        });
      };

    },

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
          var record = JSON.parse(recordData),
            preExisting = collection.findWhere({_id: record.default.name});
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