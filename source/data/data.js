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
    ['backbone', 'api/API', 'lawnchair'],
    // ['backbone', 'api/API'],
    function(Backbone, API, Lawnchair){
    // function(Backbone, API){
       var data = {
           readInteraction: function(model, options){
               var lawnchair = new Lawnchair({name:'Interactions'}, function(){
                   this.exists(model.get('name'), function(exists){
                       if (exists){
                           // We have a previously cached copy of this interaction
                           this.get(model.get('name'), function(result){
                               console.log('DB: Contains result');
                               var timeout;
                               if (result.deviceCacheTime || result.deviceCacheTime === 0) {
                                   if (result.deviceCacheTime === 0){
                                       timeout = false;
                                   } else {
                                       timeout = result.deviceCacheTime * 1000;
                                   }
                               } else {
                                   timeout = 60000;
                               }
                               if ((timeout && (new Date().getTime() - result.timestamp) > timeout) || (model.has("args") && model.get('args') !== "")){
                                   // Not permanently cached More than 60 seconds old OR There are Args involved
                                   //Fetch a newer copy
                                   if (navigator.onLine === false){
                                       console.log('Offline: returning stale copy');
                                       options.success(model, result, options);
                                   } else {
                                       console.log('Online: Result too old, fetching new copy');
                                       data.fetchInteraction(model, options, this);
                                   }
                               } else {
                                   // Still fresh. Return copy.
                                   options.success(model, result, options);
                               }
                           });
                       } else {
                           if (navigator.onLine === false){
                               // No cache, no internet connection. Fetch now and cache
                               console.log("Offline: not cached");
                               var xhr = {
                                   responseText: "Browser offline and interaction is not cached."
                               };
                               options.error(model, xhr, options);
                           } else {
                               // No cache, internet connection. Fetch now and cache
                               console.log("Online: Fetching");
                               data.fetchInteraction(model, options, this);
                           }
                       }
                   });
               });
           },

           fetchInteraction: function(model, options, lawnchair){
               API.getInteraction(model.get('siteName'), model.get('name'), model.get('args'))
                   .done(function(data, status, xhr){
                       if (data.name){
                           data.key = data.name;
                           data.timestamp = new Date().getTime();
                       } else {
                           data.key = data.siteName;
                       }
                       lawnchair.save(data, function(){
                           console.log('DB: Cached result');
                       });
                       options.success(model, data, options);
                   })
                   .fail(function(xhr, status, error){
                       options.error(model, xhr, options);
                   });
           },

           readAS: function(model, options){
               var lawnchair = new Lawnchair({name:'answerSpace'}, function(){
                   this.exists(model.get('siteName'), function(exists){
                       if (exists){
                           this.get(model.get('siteName'), function(data){
                               console.log('AS fetched from cache');
                               options.success(model, data, options);
                           });
                       } else {
                           API.getAnswerSpace(model.get('siteName'))
                               .done(function(data, status, xhr){
                                   lawnchair.save(data, function(){
                                       console.log('Cached AS in Offline Storage');
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

           readDataSuitcase: function(model, options){
               var lawnchair = new Lawnchair({name:'DataSuitcases'}, function(){
                   this.exists(model.get('name'), function(exists){
                       if (exists){
                           this.get(model.get('name'), function(data){
                               console.log('DS fetched from cache');
                               options.success(model, data, options);
                           });
                       } else {
                           API.getDataSuitcase(model.get('siteName'), model.get("name"))
                               .done(function(data, status, xhr){
                                   lawnchair.save(data, function(){
                                       console.log('Cached DS in Offline Storage');
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
                    if(model.get("type") === "interaction"){
                        data.readInteraction(model, options);
                        // API.getInteraction(model.get('siteName'), model.get('name'), model.get('args'))
                        //    .done(function(data, status, xhr){
                        //         options.success(model, data, options);
                        //     })
                        //     .fail(function(xhr, status, error){
                        //         options.error(model, xhr, options);
                        //     });

                    } else if (model.get("type") === "answerSpace"){
                        data.readAS(model, options);
                        // API.getAnswerSpace(model.get('siteName'))
                        //     .done(function(data, status, xhr){
                        //         options.success(model, data, options);
                        //     })
                        //     .fail(function(xhr, status, error){
                        //         options.error(model, xhr, options);
                        //     });
                    } else if (model.get("type") === "DataSuitcase"){
                        data.readDataSuitcase(model, options);
                          // API.getDataSuitcase(model.get('siteName'), model.get("name"))
                          //     .done(function(data, status, xhr){
                          //         options.success(model, data, options);
                          //     })
                          //     .fail(function(xhr, status, error){
                          //         options.error(model, xhr, options);
                          //     });
                    } else {
                        options.error(model, null, options);
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
