define(
  [],
  function () {
    "use strict";
    var Form = Backbone.Model.extend({
      idAttribute: "_id",

      url: function () {
        return '/_R_/common/3/xhr/GetForm.php?_v=3';
      },

      httpMethod: 'read',

      parse: function (response) {
        return {
          definition: response.definition,
          contentTime: Date.now()
        };
      }
    });

    return Form;
  }
);
