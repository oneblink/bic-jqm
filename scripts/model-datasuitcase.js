define(
  ['feature!api'],
  function (API) {
    "use strict";
    var DataSuitcase = Backbone.Model.extend({
      idAttribute: "_id",

      url: function () {
        var time = 0;

        if (this.has("contentTime")) {
          time = this.get("contentTime");
        }

        return '/_R_/common/3/xhr/GetMoJO.php?_id=' + window.BMP.BIC.siteVars.answerSpaceId + '&_m=' + this.id + '&_lc=' + time;
      },

      populate: function () {
        var model = this,
          time = 0;

        if (this.has("contentTime")) {
          time = this.get("contentTime");
        }

        API.getDataSuitcase(this.id, time).then(
          function (data) {
            model.save({
              data: data,
              contentTime: Date.now()
            });
          }
        );
      }
    });
    return DataSuitcase;
  }
);
