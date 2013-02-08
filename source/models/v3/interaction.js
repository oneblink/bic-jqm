define(
    ['data/data', 'jquery', 'jquerymobile'],
    function(Backbone, $){
        var Interaction = Backbone.Model.extend({

            defaults: {
                header: null,
                content: null,
                footer: null,
                name: null
            },

            inherit: function(){
                if (this.has("parent")){
                    var app = require('models/v3/application');
                    var parent;
                    if (this.get("parent") !== "app"){
                        // Not the answerSpace config, so go deeper
                        parent = app.interactions.get(this.get("parent"));
                        parent.inherit();
                    } else {
                        parent = app;
                    }
                    for (var attribute in parent.attributes){
                        if (!this.has(attribute)){
                            this.set(attribute, parent.get(attribute));
                        }
                    }
                }
                return this;
            }

        });

        return Interaction;
    });