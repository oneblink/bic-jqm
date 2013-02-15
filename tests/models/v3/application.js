define(
    ['data/data', 'collections/v3/interactions', 'collections/v3/datasuitcases', 'models/v3/DataSuitcase'],
    function(Backbone, InteractionCollection, DataSuitcaseCollection, DataSuitcase){
        var Application = Backbone.Model.extend({

            initialize: function() {
                // Nested interactions
                this.interactions = new InteractionCollection();

                // Nested Data Suitcases
                this.datasuitcases = new DataSuitcaseCollection();

                this.on('change', this.update);
            },

            update: function() {
                if (this.has("DataSuitcases")){
                   var ds = this.get("DataSuitcases");
                   for (var int = 0; int < ds.length; int++) {
                       if (this.datasuitcases.where({name: ds[int]}).length === 0){
                            console.log("We don't have this data suitcase yet!")
                            var dsmodel = new DataSuitcase({
                                name: ds[int],
                                siteName: this.get("siteName"),
                                type: "DataSuitcase"
                            });
                            this.datasuitcases.add(dsmodel);
                            dsmodel.fetch();
                       }
                   }
                }
            }

            // url: function() {
            //     return "/_BICv3_/xhr/GetApp.php?asn=" + this.get("answerspace");
            // }

        });

        var app = new Application();

        return app;
    });
