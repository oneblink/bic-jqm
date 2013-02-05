//The method signature of Backbone.sync is sync(method, model, [options])
//method – the CRUD method ("create", "read", "update", or "delete")
//model – the model to be saved (or collection to be read)
//options – success and error callbacks, and all other jQuery request options
//when Backbone.sync sends up a request to save a model, its attributes will be passed, serialized as JSON, and sent in the HTTP body with content-type application/json
//When returning a JSON response, send down the attributes of the model that have been changed by the server
//When responding to a "read" request from a collection (Collection#fetch), send down an array of model attribute objects.
//Whenever a model or collection begins a sync with the server, a "request" event is emitted.
//If the request completes successfully you'll get a "sync" event,
//and an "error" event if not.

define(
    ['backbone', 'api/API', 'lawnchair', 'lawnchair-webkit-sqlite'],
    function(Backbone, API, Lawnchair){
        var data = {
            readInteraction: function(model, options){
                var lawnchair = new Lawnchair({name:'Interactions'}, function(){
                    this.exists(model.get('name'), function(exists){
                        if (exists){
                            this.get(model.get('name'), function(data){
                                console.log('Result fetched from cache');
                                options.success(model, data, options);
                            });
                        } else {
                            API.getInteraction(model.get('siteName'), model.get('name'))
                                .done(function(data, status, xhr){
                                    if (data.name){
                                        data.key = data.name;
                                    } else {
                                        data.key = data.siteName;
                                    }
                                    lawnchair.save(data, function(){
                                        console.log('Cached result in Offline Storage');
                                    });
                                    options.success(model, data, options);
                                })
                                .fail(function(xhr, status, error){
                                    options.error(model, xhr, options);
                                });
                        }
                    });
                });
            },

            readAS: function(model, options){
                var lawnchair = new Lawnchair({name:'answerSpace'}, function(){
                    this.exists(model.get('siteName'), function(exists){
                        if (exists){
                            this.get(model.get('siteName'), function(data){
                                console.log('Result fetched from cache');
                                options.success(model, data, options);
                            });
                        } else {
                            API.getAnswerSpace(model.get('siteName'))
                                .done(function(data, status, xhr){
                                    lawnchair.save(data, function(){
                                        console.log('Cached result in Offline Storage');
                                    });
                                    options.success(model, data, options);
                                })
                                .fail(function(xhr, status, error){
                                    options.error(model, xhr, options);
                                });
                        }
                    });
                });
            }
        };

        Backbone.sync = function(method, model, options){
            

            switch (method) {
                case "read":
                    if(model.has("name")){
                        data.readInteraction(model, options);
                    } else {
                        data.readAS(model, options);
                    }
                    break;

                case "create":
                    console.log("Method = create");
                    break;
                case "update":
                    console.log("Method = update");
                    break;
                case "delete":
                    console.log("Method = delete");
                    break;
            }
        };

        return Backbone;
    }
);