define(
  ['feature!api'],
  function (API) {
    "use strict";
    var Form = Backbone.Model.extend({
      idAttribute: "_id",

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
