define(
  ['model-pending', 'feature!data', 'feature!api'],
  function (PendingItem, Data, API) {
    'use strict';
    var PendingCollection = Backbone.Collection.extend({
      model: PendingItem,

      datastore: function () {
        this.data = new Data(window.BMP.BIC.siteVars.answerSpace.toLowerCase() + '-Pending');
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

      processQueue: function () {
        var promises, callback;
        promises = [];
        callback = function (element, innerCallback) {
          return function (data, status, xhr) {
            var errors;

            if (data && xhr.status === 200) {
              element.save({
                status: 'Submitted',
                result: data
              });
            } else if (status === 'error' && data.responseText) {
              errors = JSON.parse(data.responseText);
              element.save({
                status: 'Failed Validation',
                errors: errors
              });
            }
            element.trigger('processed');
            innerCallback();
          };
        };

        _.each(this.where({status: 'Pending'}), function (element) {
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
  }
);
