define(
    ['jquery', 'backbone', 'mustache', 'text!templates/v3/interaction.html', 'models/v3/application', 'jquerymobile'],
    function ($, Backbone, Mustache, Template, app) {
        var InteractionView = Backbone.View.extend({

            initialize: function(){
                if (this.model){
                    this.listenTo(this.model, "change", this.render);
                    if (this.model.has("themeSwatch")){
                        this.$el.attr("data-theme", this.model.get("themeSwatch"));
                    }
                }

                $('body').append(this.$el);
            },

            events: {
                // Blink Link Format Stuffs
                "click [keyword]" : "blinklink",
                "click [interaction]" : "blinklink",
                "click [category]" : "blinklink",
                "click [masterCategory]" : "blinklink",
                "click [back]" : "back",
                "click [home]" : "blinklink",
                "click [login]" : "blinklink"
            },

            attributes: {
                "data-role": "page"
            },

            blinklink: function(e) {
                e.preventDefault();
                console.log('Matched a BlinkLink');
                if (e.target.tagName !== 'A') {
                    $element = $(e.target).parents('a');
                } else {
                    $element = $(e.target);
                }
                
                if ($element.attr("keyword")){
                    path = $element.attr("keyword");
                } else if ($element.attr("interaction")){
                    path = $element.attr("interaction");
                } else if ($element.attr("category")){
                    path = $element.attr("category");
                } else if ($element.attr("masterCategory")){
                    path = $element.attr("masterCategory");
                } else if ($element.attr("home")){
                    path = this.get("siteName");
                } else if ($element.attr("login")){
                    path = this.get("siteName");
                }
                //router.navigate(Backbone.history.fragment + "/" + path, {trigger: true});
                $.mobile.changePage($.mobile.path.parseLocation().pathname + '/' + path);
            },

            back: function(e) {
                e.preventDefault();
                history.back();
            },

            render: function() {
                this.$el.html(Mustache.render(Template, this.model.attributes));
                //this.$el.page().trigger("pagecreate");
                return this;
            }

        });

        return InteractionView;
    });