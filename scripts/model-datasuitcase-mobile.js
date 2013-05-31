define(
  ['wrapper-backbone', 'api-php'],
  function (Backbone, API) {
    "use strict";
    var DataSuitcase = Backbone.Model.extend({
      idAttribute: "_id",

      populate: function () {
        var model = this,
          time = 0;

        if (this.has("contentTime")) {
          time = this.get("contentTime");
        }

        API.getDataSuitcase(this.id, time).then(
          function (data, textStatus, jqXHR) {
            model.save({
              data: data,
              contentTime: Date.now()
            });
          },
          function (jqXHR, textStatus, errorThrown) {
            console.log(errorThrown);
          }
        );
      }
    });
    return DataSuitcase;
  }
);
