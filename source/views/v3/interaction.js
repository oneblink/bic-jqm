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

                // Get the actual element
                if (e.target.tagName !== 'A') {
                    $element = $(e.target).parents('a');
                } else {
                    $element = $(e.target);
                }
                
                var location = "";
                // Get the thing we are supposed to get to
                if ($element.attr("keyword")){
                    location = $element.attr("keyword");
                } else if ($element.attr("interaction")){
                    location = $element.attr("interaction");
                } else if ($element.attr("category")){
                    location = $element.attr("category");
                } else if ($element.attr("masterCategory")){
                    location = $element.attr("masterCategory");
                } else if ($element.attr("home")){
                    location = this.get("siteName");
                } else if ($element.attr("login")){
                    location = this.get("siteName");
                }

                // Get the _attributes we need to pass along
                var attributes = "", first = true;
                for (var count = 0; count < $element[0].attributes.length; count++){
                    if ($element[0].attributes[count].name.substr(0,1) === "_"){
                        if (!first) {
                            attributes += "&args[" + $element[0].attributes[count].name + "]=" + $element[0].attributes[count].value;
                        } else {
                            first = false;
                            attributes = "/?args[" + $element[0].attributes[count].name.substr(1) + "]=" + $element[0].attributes[count].value;
                        }
                        
                    }
                }

                // Fix any irregulatities with the path (old args, etc)
                var path = $.mobile.path.parseLocation().pathname;
                if ($.mobile.path.parseLocation().search) {
                    path = $.mobile.path.parseLocation().pathname.substr(0, $.mobile.path.parseLocation().pathname.length - 1);
                }

                $.mobile.changePage(path + '/' + location + attributes);
            },

            back: function(e) {
                e.preventDefault();
                history.back();
            },

            render: function() {
                this.$el.html(Mustache.render(Template, this.model.attributes));
                this.maps();
                //this.$el.page().trigger("pagecreate");
                return this;
            },

            maps: function() {
                var mapdiv = this.$el.find("[class=googlemap]");
                if (mapdiv.length !== 0){
                    this.$el.append('<style type="text/css">.googlemap { width: 100%; height: 360px; }</style>');
                    this.$el.append('<script src="/_BICv3_/js/gMaps.js"></script>');
                }
            }
        });

        return InteractionView;
    });