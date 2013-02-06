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
                if ((!(this.has("header"))) || this.get("header") === ""){
                    this.set({header: this.get("parent").get("header")});
                }
                if ((!(this.has("footer"))) || this.get("footer") === ""){
                    this.set({footer: this.get("parent").get("footer")});
                }
                return this;
            }

        });

        return Interaction;
    });