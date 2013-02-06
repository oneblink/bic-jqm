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
                this.on('changePage', this.changePage);

                $('body').append(this.$el);
            },

            events: {
                // jQuery Mobile Compatability Stuffs
                "click [data-rel=back]" : "back",
                "click [rel=external]" : "external",
                "click [data-ajax=false]" : "external",
                //"click [data-rel='back']" : "back"

                // Blink Link Format Stuffs
                "click [keyword]" : "blinklink",
                "click [interaction]" : "blinklink",
                "click [category]" : "blinklink",
                "click [masterCategory]" : "blinklink",
                "click [back]" : "back",
                "click [home]" : "blinklink",
                "click [login]" : "blinklink",

                // Standard HTML Stuffs
                "click a [target]" : "external",

                // OMG A NORMAL LINK WTF BRO
                // You seriously dont want to mess with this when doing one of the above methods
                "click a:not([data-rel=back],[rel=external],[data-ajax=false],[keyword],[interaction],[category],[masterCategory],[back],[home],[login],[target])" : "link"

                // And if people decide to combine the above attributes, well, they are asking for trouble anyway
            },

            attributes: {
                "data-role": "page"
            },

            link: function(e) {
                e.preventDefault();
                console.log('Matched normal link');
                var router = require('routers/v3/router');
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
                // TODO: Fix it up to work with _args
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
                router.navigate(Backbone.history.fragment + "/" + path, {trigger: true});
            },

            back: function(e) {
                e.preventDefault();
                console.log('Going back!');
                if (app.has("previousURL")){
                    var router = require('routers/v3/router');
                    //router.navigate(app.get("previousURL"), {trigger: true});
                    history.back();
                }
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