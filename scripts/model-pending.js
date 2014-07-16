define(
  [],
  function () {
    "use strict";
    var PendingItem = Backbone.Model.extend({
      idAttribute: "_id",

      url: function () {
        return '/_R_/common/3/xhr/SaveFormRecord.php?_asid=' + window.BMP.BIC.siteVars.answerSpaceId + '&_fn=' + this.get('name') + '&_action=' + this.get('action');
      },

      httpMethod: 'read'
    });

    return PendingItem;
  }
);
