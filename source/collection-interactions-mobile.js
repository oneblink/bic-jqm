define(
  ['backbone', 'model-interaction-mobile'],
  function (Backbone, Interaction) {
    "use strict";
    var InteractionCollection = Backbone.Collection.extend({

      model: Interaction,

      url: function () {
        return "/_BICv3_/xhr/GetInteraction.php?asn=" + this.app.get("answerspace");
      }

    });

    return InteractionCollection;
  }
);