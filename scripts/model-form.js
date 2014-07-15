define(
  ['feature!api'],
  function (API) {
    "use strict";
    var Form = Backbone.Model.extend({
      idAttribute: "_id",

      url: function () {
        return '/_R_/common/3/xhr/GetForm.php?_v=3';
      },

      populate: function () {
        var model = this;
        API.getForm(this.id).then(
          function (data) {
            model.save({
              definition: data.definition,
              contentTime: Date.now()
            });
          }
        );
      }
    });

    return Form;
  }
);
