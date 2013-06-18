define(
  ['wrapper-backbone', 'model-application-mobile', 'api-php'],
  function (Backbone, app, API) {
    "use strict";
    var Form = Backbone.Model.extend({
      idAttribute: "_id",

      populate: function () {
        var model = this;
        API.getForm(this.id).then(
          function (data, textStatus, jqXHR) {
            model.save({
              definition: data.definition,
              contentTime: Date.now()
            });
          },
          function (jqXHR, textStatus, errorThrown) {
            console.log(errorThrown);
          }
        );
      }
    });

    return Form;
  }
);
