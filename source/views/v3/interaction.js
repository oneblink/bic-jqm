define(
    ['jquery', 'backbone', 'mustache', 'text!templates/v3/interaction.html', 'jquery.mobile'],
    function ($, Backbone, Mustache, Template) {
        var InteractionView = Backbone.View.extend({

            initialize: function(){
                if (this.model){
                    this.listenTo(this.model, "change", this.render);
                    if (this.model.has("themeSwatch")){
                        this.$el.attr("data-theme", this.model.get("themeSwatch"));
                    }
                }
                this.on('changePage', this.changePage);

                $('body').append(this.$el);
            },

            events: {
                // jQuery Compatability Stuffs
                "click [data-rel=back]" : "back",
                "click [rel=external]" : "external",
                "click [data-ajax=false]" : "external",
                //"click [data-rel='back']" : "back"

                // Previous Link Format Stuffs
                "click [keyword]" : "blinklink",
                "click [interaction]" : "blinklink",
                "click [category]" : "blinklink",
                "click [masterCategory]" : "blinklink",
                "click [back]" : "blinklink",
                "click [home]" : "blinklink",
                "click [login]" : "blinklink",

                // Standard HTML Stuffs
                "click a [target]" : "link",
                "click a:not([data-rel=back],[rel=external],[data-ajax=false],[keyword],[interaction],[category],[masterCategory],[back],[home],[login],[target])" : "link"
            },

            attributes: {
                "data-role": "page"
            },

            link: function(e) {
                e.preventDefault();
                console.log('Matched normal link');
                var router = require('routers/v3/router');
                // TODO: Come back to this for IE
                if (e.target.tagName !== 'A') {
                    path = $(e.target).parents('a')[0].pathname;
                } else {
                    path = e.target.pathname;
                }
                router.navigate(path, {trigger: true});
            },

            blinklink: function(e) {
                e.preventDefault();
                console.log('Matched a BlinkLink');
                var router = require('routers/v3/router');
                // TODO: Come back to this for IE AND fix it up to work with _args
                router.navigate(Backbone.history.fragment + "/" + e.currentTarget.attributes["interaction"].textContent, {trigger: true});
            },

            back: function(e) {
                e.preventDefault();
                console.log('Going back!');
                Backbone.history.history.back();
            },

            external: function(e) {
                e.preventDefault();
                console.log("Not yet implemented");
            },

            render: function() {
                this.$el.html(Mustache.render(Template, this.model.attributes));
                this.$el.page().trigger("pagecreate");
                return this;
            },

            changePage: function() {
                $.mobile.changePage("#" + this.model.get("name"), { changeHash: false });
                return this;
            }

        });

        return InteractionView;
    });