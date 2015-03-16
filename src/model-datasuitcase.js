define(
  ['feature!api'],
  function (API) {
    'use strict';
    var DataSuitcase = Backbone.Model.extend({
      idAttribute: '_id',

      populate: function () {
        var model = this,
          time = 0;

        if (this.has('contentTime')) {
          time = this.get('contentTime');
        }

        return new Promise(function (resolve, reject) {
          API.getDataSuitcase(model.id, time).then(
            function (data) {
              model.save({
                data: data,
                contentTime: Date.now()
              }, {
                success: resolve,
                error: reject
              });
            }
          );
        });
      }
    });
    return DataSuitcase;
  }
);
