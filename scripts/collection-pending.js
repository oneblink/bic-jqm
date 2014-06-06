define(
  ['model-pending', 'feature!data', 'api'],
  function (PendingItem, Data, API) {
    "use strict";
    var PendingCollection = Backbone.Collection.extend({
      model: PendingItem,

      datastore: function () {
        this.data = new Data(window.BMP.BIC.siteVars.answerSpace + '-Pending');
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
        _.each(this.where({status: "Pending"}), function (element) {
          /*jslint unparam: true*/
          API.setPendingItem(element.get('name'), element.get('action'), element.get('data')).always(
            function (data, status, xhr) {
              // NEED TO CHECK STATUS === 200 && RESULT !== BLANK!!!!
              //element.destroy({wait: true});
              if (data && xhr.status === 200) {
                element.set({status: 'Submitted'});
                element.set({result: data});
              }
              element.trigger('processed');
            }
          );
          /*jslint unparam: false*/
        }, this);
      }
    });

    return PendingCollection;
  }
);
