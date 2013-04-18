define(
  ['data-pouch', 'collection-interactions-mobile', 'collection-datasuitcases-mobile', 'model-datasuitcase-mobile', 'collection-forms-mobile', 'model-form-mobile', 'underscore'],
  function (Backbone, InteractionCollection, DataSuitcaseCollection, DataSuitcase, FormCollection, Form, _) {
    "use strict";
    var Application = Backbone.Model.extend({

      initialize: function () {
        // Nested Collections
        this.interactions = new InteractionCollection();
        this.datasuitcases = new DataSuitcaseCollection();
        this.forms = new FormCollection();

        // Sample Forms
        //this.set({Forms: ["Sample1", "Sample2", "Sample3", "Sample4", "Sample5", "form2"]});

        this.on('change', this.update);
      },

      idAttribute: "_id",

      update: function () {
        var modelArray,
          count,
          model,
          children = {
            DataSuitcases: this.datasuitcases,
            Forms: this.forms
          };

        _.each(children, function (element, index, list) {
          if (this.has(index)) {
            modelArray = this.get(index);
            for (count = 0; count < modelArray.length; count = count + 1) {
              if (element.where({name: modelArray[count]}).length === 0) {
                switch (index) {
                case "DataSuitcases":
                  model = new DataSuitcase({
                    _id: modelArray[count],
                    siteName: this.get("siteName"),
                    BICtype: "DataSuitcase"
                  });
                  break;
                case "Forms":
                  model = new Form({
                    _id: modelArray[count],
                    siteName: this.get("siteName"),
                    BICtype: "Form"
                  });
                  break;
                }
                element.add(model);
                model.fetch();
              }
            }
          }
        }, this);
      }
    }),
      app;

    app = new Application();

    return app;
  }
);
