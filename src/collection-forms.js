define(
  ['model-form', 'feature!data', 'feature!api'],
  function (Form, Data, API) {
    'use strict';
    var FormCollection = Backbone.Collection.extend({
      model: Form,

      initialize: function () {
        if (!BlinkForms) {
          window.BlinkForms = {};
        }
        BlinkForms.getDefinition = function (name, action) {
          return new Promise(function (resolve, reject) {
            require(['model-application'], function (app) {
              var def = app.forms.get(name);

              if (!def) {
                return reject(new Error('unable to locate "' + name + '" definition'));
              }

              try {
                resolve(BlinkForms.flattenDefinition(def.attributes, action));
              } catch (err) {
                reject(err);
              }
            });
          });
        };
      },

      datastore: function () {
        this.data = new Data(window.BMP.BIC.siteVars.answerSpace.toLowerCase() + '-Form');
        return this;
      },

      load: function () {
        var collection = this;

        return new Promise(function (resolve, reject) {
          collection.fetch({
            success: resolve,
            error: reject
          });
        });
      },

      download: function () {
        var collection = this;

        if (!(navigator.onLine || window.BMP.BIC.isBlinkGap)) {
          return Promise.resolve();
        }

        API.getForm().then(function (data) {
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
  }
);
