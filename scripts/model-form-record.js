define(
  ['api'],
  function (API) {
    "use strict";
    var FormRecord = Backbone.Model.extend({
      idAttribute: "_id",

      populate: function (action) {
        var model = this;
        API.getFormRecord(model.get('formName'), action, model.id).then(
          function (data) {
            model.save({
              record: data,
              contentTime: Date.now()
            });
          }
        );
      }
    });

    return FormRecord;
  }
);

