define(
    ['data/data', 'collections/v3/interactions', 'underscore'],
    function(Backbone, InteractionCollection, _){
        var Application = Backbone.Model.extend({

            initialize: function() {
                // Nested interactions
                this.interactions = new InteractionCollection();
            }

            // url: function() {
            //     return "/_BICv3_/xhr/GetApp.php?asn=" + this.get("answerspace");
            // }

        });

        var app = new Application();

        return app;
    });