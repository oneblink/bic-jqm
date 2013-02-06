define(
    ['backbone', 'models/v3/application', 'models/v3/interaction', 'views/v3/interaction', 'jquery', 'json2', 'jquerymobile'],
    function(Backbone, app, InteractionModel, InteractionView, $, JSON){
        var Router = Backbone.Router.extend({

            routes: {
                ":answerspace(/)": "home",
                ":answerspace(/*path)/:interaction(/)": "interaction"
            },

            home: function(answerspace) {
                console.log('Routing to answerSpace');
                this.history();
                if (app.has("homeScreen") && app.get("homeScreen") === "true"){
                    console.log("Using custom home interaction");
                    this.interaction(answerspace, null, app.get("homeInteraction"));
                } else {
                    console.log("Using default home interaction");
                    this.interaction(answerspace, null, answerspace);
                }
            },

            interaction: function(answerspace, path, name) {
                console.log('Routing an Interaction');
                //this.history();
                
                //if(app.has("answerspace")){
                    
                    // Load in any items along the path
                    var parent = app;
                    if (path){
                        var interactions = path.split('/');
                        for (var index = 0; index < interactions.length; index ++){
                            app.interactions.add({
                                name: interactions[index],
                                parent: parent
                            }).where({name: interactions[index]})[0].fetch();
                            parent = app.interactions.where({name: interactions[index]})[0];
                        }
                    }

                    // And then the actual requested thingy too
                    $.mobile.loading('show');
                    app.interactions.add({
                        name: name,
                        parent: parent
                    }).where({name: name})[0].fetch({
                        success: function(model, response, options){
                            options.router.history();

                            model.inherit();
                            var view = new InteractionView({
                                id: model.get("name"),
                                tagName: 'div',
                                model: model
                            }).render().trigger("changePage");
                            
                            options.app.set("currentView", view);
                            options.app.set("currentURL", Backbone.history.fragment);

                            options.$.mobile.loading('hide');
                            
                            //options.router.clean();
                        },
                        error: function(model, xhr, options){
                            options.$.mobile.loading('hide');
                            console.log("Error loading page");
                            // $.mobile.loading('show', {
                            //     text: "Error Loading Page",
                            //     textOnly: true,
                            //     theme: "e"
                            // });
                        },
                        router: this,
                        $: $,
                        app: app
                    });
                //}
            },

            history: function() {
                console.log("Updating history");
                if (app.has("currentURL")){
                    app.set("previousURL", app.get("currentURL"));
                }
                if (app.has("currentView")){
                    app.set("previousView", app.get("currentView"));
                }
            },

            clean: function(){
                console.log("Performing DOM clean");
                if(app.has("previousView")){
                    //app.interactions.remove(app.get("previousPage").model);
                    //console.log(app.get("previousPage"));
                    app.get("previousView").remove();
                }
            }

        });

        return new Router();
    });