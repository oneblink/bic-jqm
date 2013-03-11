define(
  ['data/data', 'collections/v3/interactions', 'collections/v3/datasuitcases', 'models/v3/DataSuitcase'],
  function (Backbone, InteractionCollection, DataSuitcaseCollection, DataSuitcase) {
    "use strict";
    var Application = Backbone.Model.extend({

      initialize: function () {
                // Nested interactions
        this.interactions = new InteractionCollection();

                // Nested Data Suitcases
        this.datasuitcases = new DataSuitcaseCollection();

        this.on('change', this.update);
      },

      update: function () {
        if (this.has("DataSuitcases")) {
          var ds = this.get("DataSuitcases"),
            count,
            dsmodel;
          for (count = 0; count < ds.length; count = count + 1) {
            if (this.datasuitcases.where({name: ds[count]}).length === 0) {
              dsmodel = new DataSuitcase({
                name: ds[count],
                siteName: this.get("siteName"),
                BICtype: "DataSuitcase"
              });
              this.datasuitcases.add(dsmodel);
              dsmodel.fetch();
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
