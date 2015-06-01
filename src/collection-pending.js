define(
  ['model-pending', 'collection', 'api'],
  function (PendingItem, Collection, API) {
    'use strict';

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
