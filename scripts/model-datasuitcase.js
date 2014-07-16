define(
  [],
  function () {
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

      httpMethod: 'read',

      parse: function (response) {
        return {
          data: response.data,
          contentTime: Date.now()
        };
      }
    });
    return DataSuitcase;
  }
);
