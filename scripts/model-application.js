define(
  ['collection-interactions', 'collection-datasuitcases', 'collection-forms', 'collection-pending', 'feature!data', 'api', 'collection-stars', 'domReady'],
  function (InteractionCollection, DataSuitcaseCollection, FormCollection, PendingCollection, Data, API, StarsCollection, domReady) {
    "use strict";
    var Application = Backbone.Model.extend({

      initialize: function () {
        var done, app;
        app = this;
        BMP.FileInput.initialize();
        require(['router'], function (router) {
          app.set({
            _id: window.BMP.BIC.siteVars.answerSpace
          });

          app.on('change', app.update);

          app.data = new Data(window.BMP.BIC.siteVars.answerSpace + '-AnswerSpace');

          app.interactions = new InteractionCollection();
          app.datasuitcases = new DataSuitcaseCollection();
          app.forms = new FormCollection();
          app.pending = new PendingCollection();
          app.stars = new StarsCollection();

          app.router = router;
          $(document).on('pagebeforeload', function (e, data) {
            e.preventDefault();
            $.mobile.loading('show');
            if (app.has('currentInteraction') && app.get('currentInteraction').get('dbid') === "i" + app.get('loginPromptInteraction')) {
              app.checkLoginStatus().then(function () {
                app.router.routeRequest(data);
              });
            } else {
              app.router.routeRequest(data);
            }
          });

          done = function () {
            if (navigator.onLine) {
              app.populate().then(function () {
                app.initialRender();
              });
            } else {
              app.fetch({
                success: function () {
                  app.initialRender();
                },
                error: function () {
                  app.populate().then(function () {
                    app.initialRender();
                  });
                }
              });
            }
          };

          Promise.all([
            app.interactions.initialize,
            app.datasuitcases.initialize,
            app.forms.initialize,
            app.pending.initialize,
            app.stars.initialize
          ]).then(done, done);
        });
      },

      idAttribute: "_id",

      defaults: {
        loginStatus: false
      },

      populate: function () {
        var app = this;

        return new Promise(function (resolve, reject) {
          API.getAnswerSpaceMap().then(
            function (data) {
              var models = [];
              _.each(data, function (value, key) {
                var model;
                if (key.substr(0, 1) === 'c' || key.substr(0, 1) === 'i') {
                  model = value.pertinent;
                  model._id = model.name.toLowerCase();
                  model.dbid = key;
                  models.push(model);
                }
                if (key.substr(0, 1) === 'a') {
                  model = {
                    _id: window.BMP.BIC.siteVars.answerSpace.toLowerCase(),
                    dbid: key
                  };
                  models.push(model);

                  app.save(value.pertinent);
                }
              }, app);

              app.interactions.set(models).save();
              _.each(_.compact(_.uniq(app.interactions.pluck('xml'))), function (element) {
                if (!app.datasuitcases.get(element)) {
                  app.datasuitcases.create({_id: element}, {success: function (model) {
                    model.populate();
                  }});
                } else {
                  if (navigator.onLine) {
                    app.datasuitcases.get(element).populate();
                  }
                }
              });

              app.trigger("initialize");
              resolve();
            },
            function () {
              reject();
            }
          );
        });
      },

      checkLoginStatus: function () {
        //false
        var app = this;

        return new Promise(function (resolve) {
          API.getLoginStatus().then(function (data) {
            var status = data.status || data;
            if (app.get('loginStatus') !== status) {
              app.interactions.reset();
              app.datasuitcases.reset();
              app.forms.reset();
              app.populate().then(function () {
                app.set({loginStatus: status});
                resolve();
              });
            } else {
              resolve();
            }
          });
        });
      },

      initialRender: function () {
        var app = this;
        $.mobile.defaultPageTransition = app.get("defaultTransition");
        domReady(function () {
          $.mobile.changePage($.mobile.path.parseLocation().href, {
            changeHash: false,
            reloadPage: true,
            transition: 'fade'
          });
          $(document).on('pageshow', function () {
            $('#temp').remove();
          });
        });
      }
    });

    window.BMP.BIC3 = new Application();

    return window.BMP.BIC3;
  }
);
