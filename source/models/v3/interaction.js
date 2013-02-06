define(
    ['data/data', 'jquery', 'jquery.mobile'],
    function(Backbone, $){
        var Interaction = Backbone.Model.extend({

            initialize: function(){
                this.set("siteName", this.get("parent").get("siteName"));
            },

            defaults: {
                header: null,
                content: null,
                footer: null,
                name: null
            },

            inherit: function(){
                if (this.has("parent")){
                    if (this.get("parent").has("parent")){
                        this.get("parent").inherit();
                    }
                    for (var attribute in this.get("parent").attributes){
                        if (!this.has(attribute)){
                            this.set(attribute, this.get("parent").get(attribute));
                        }
                    }
                }
                return this;
            }

        });

        return Interaction;
    });