define(
  ['wrapper-backbone', 'model-star-mobile', 'jquery', 'underscore', 'data-pouch'],
  function (Backbone, Star, $, _, Data) {
    "use strict";
    var FormCollection = Backbone.Collection.extend({
      model: Star,

      initialize: function () {
        var collection = this;
        collection.data = new Data(window.BMP.siteVars.answerSpace + '-Star');
        collection.fetch({
          success: function () {
            collection.trigger("initialize");
          },
          error: function () {
            collection.trigger("initialize");
          }
        });
      }
    });
    return FormCollection;
  }
);
