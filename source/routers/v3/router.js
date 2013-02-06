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
                // $.mobile.loading('show');
                // app.interactions.add({
                //     name: answerspace
                // }).where({name: answerspace})[0].fetch({
                //     success: function(model, response, options){
                //         model.inherit();
                //         var view = new InteractionView({
                //             id: model.get("name"),
                //             tagName: 'div',
                //             model: model
                //         }).render().trigger("changePage");

                //         $.mobile.loading('hide');
                //     },
                //     error: function(model, xhr, options){
                //         $.mobile.loading('hide');
                //         console.log("Error loading page");
                //         // $.mobile.loading('show', {
                //         //     text: "Error Loading Page",
                //         //     textOnly: true,
                //         //     theme: "e"
                //         // });
                //     }
                // });
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
                            
                            options.app.set("currentPage", view);
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
                if (app.has("currentPage")){
                    app.set("previousPage", app.get("currentPage"));
                }
            },

            clean: function(){
                console.log("Performing DOM clean");
                if(app.has("previousPage")){
                    //app.interactions.remove(app.get("previousPage").model);
                    //console.log(app.get("previousPage"));
                    app.get("previousPage").remove();
                }
            }

        });

        return new Router();
    });