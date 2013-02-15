define(
    ['backbone', 'models/v3/application', 'models/v3/interaction', 'views/v3/interaction', 'jquery', 'jquerymobile'],
    function(Backbone, app, InteractionModel, InteractionView, $){
        var Router = Backbone.Router.extend({

            initialize: function(){
                $(document).on('pagebeforeload', function(e, data){
                    e.preventDefault();
                    $.mobile.loading('show');
                    console.log("Time to navigate!");

                    var path = data.dataUrl.substr(1).split('/');

                    var answerspace, interaction, args;
                    if (path.length === 1){
                        if (app.has("homeScreen") && app.get("homeScreen" === true)){
                            answerspace = app.get("siteName");
                            interaction = app.get("homeInteraction");
                            args = "";
                        } else {
                            answerspace = app.get("siteName");
                            interaction = app.get("siteName");
                            args = "";
                        }
                        path = [];
                    } else {
                        answerspace = path.shift();
                        var end = path.pop();
                        if (end && end.substr(0,1) === "?"){
                            args = "&" + end.substr(1);
                            interaction = path.pop();
                        } else {
                            args = "";
                            interaction = end;
                        }
                    }
                    
                    var parent = "app";

                    if (path.length > 0){
                        for (var index = 0; index < path.length; index ++){
                            var tempmodel = new InteractionModel({
                                name: path[index],
                                parent: parent,
                                siteName: app.get("siteName"),
                                type: "interaction"
                            });
                            app.interactions.add(tempmodel);
                            tempmodel.fetch();
                            parent = tempmodel.cid;
                        }
                    }

                    var model = new InteractionModel({
                        name: interaction,
                        parent: parent,
                        siteName: app.get("siteName"),
                        type: "interaction",
                        args: args
                    });
                    app.interactions.add(model);
                    model.fetch({
                        success: function(model, response, options){
                            model.inherit();
                            var view = new InteractionView({
                                tagName: 'div',
                                model: model
                            }).render();
                            view.$el.attr("data-url", options.data.dataUrl);
                            view.$el.attr("data-external-page", true);
                            view.$el.one('pagecreate', $.mobile._bindPageRemove);
                            
                            options.data.deferred.resolve(options.data.absUrl, options.data.options, view.$el);
                        },
                        error: function(model, xhr, options){
                            options.data.deferred.reject(options.data.absUrl, options.data.options);
                            $.mobile.showPageLoadingMsg( $.mobile.pageLoadErrorMessageTheme, $.mobile.pageLoadErrorMessage, true );
                            setTimeout( $.mobile.hidePageLoadingMsg, 1500 );
                        },
                        data: data,
                        app: app
                    });
                });
            }
        });

        return new Router();
    });