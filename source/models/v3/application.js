define(
  ['data/data', 'collections/v3/interactions', 'collections/v3/datasuitcases', 'models/v3/DataSuitcase', 'collections/v3/forms', 'models/v3/form'],
  function (Backbone, InteractionCollection, DataSuitcaseCollection, DataSuitcase, FormCollection, Form) {
    "use strict";
    var Application = Backbone.Model.extend({

      initialize: function () {
                // Nested interactions
        this.interactions = new InteractionCollection();

                // Nested Data Suitcases
        this.datasuitcases = new DataSuitcaseCollection();
        this.forms = new FormCollection();

        this.on('change', this.update);
      },

      update: function () {
        var modelArray = this.get("DataSuitcases"),
          count,
          model,
          children = {
            DataSuitcases: this.datasuitcases,
            Forms: this.forms
          };


        if (this.has("DataSuitcases")) {
          modelArray = this.get("DataSuitcases");
          for (count = 0; count < modelArray.length; count = count + 1) {
            if (this.datasuitcases.where({name: modelArray[count]}).length === 0) {
              model = new DataSuitcase({
                name: modelArray[count],
                siteName: this.get("siteName"),
                BICtype: "DataSuitcase"
              });
              this.datasuitcases.add(model);
              model.fetch();
            }
          }
        }
      }
    }),
      app;

    app = new Application();

    return app;
  }
);
