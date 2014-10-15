define(
  ['collection-interactions', 'collection-datasuitcases', 'collection-forms', 'collection-pending', 'feature!data', 'feature!api', 'collection-stars', 'domReady', 'collection-form-records'],
  function (InteractionCollection, DataSuitcaseCollection, FormCollection, PendingCollection, Data, API, StarsCollection, domReady, FormRecordsCollection) {
    "use strict";
    var Application = Backbone.Model.extend({

      idAttribute: "_id",

      defaults: {
        _id: window.BMP.BIC.siteVars.answerSpace,
        loginStatus: false
      },

      datastore: function () {
        this.data = new Data(window.BMP.BIC.siteVars.answerSpace + '-AnswerSpace');
        return this;
      },

      collections: function () {
        var app = this;

        app.interactions = new InteractionCollection();
        app.datasuitcases = new DataSuitcaseCollection();
        app.forms = new FormCollection();
        app.pending = new PendingCollection();
        app.stars = new StarsCollection();
        app.formRecords = new FormRecordsCollection();

        return Promise.all([
          app.interactions.datastore().load(),
          app.datasuitcases.datastore().load(),
          app.forms.datastore().load(),
          app.pending.datastore().load(),
          app.stars.datastore().load(),
          app.formRecords.datastore().load()
        ]);
      },

      setup: function () {
        var app = this;

        return new Promise(function (resolve, reject) {
          app.fetch({
            success: resolve,
            error: reject
          });
        });
      },

      populate: function () {
        var app = this;

        if (!(navigator.onLine || window.BMP.BIC.isBlinkGap)) {
          return Promise.resolve();
        }

        return Promise.resolve(API.getAnswerSpaceMap())
          .then(
            function (data) {
              return Promise.all(_.compact(_.map(data, function (value, key) {
                var model;
                if (key.substr(0, 1) === 'c' || key.substr(0, 1) === 'i') {
                  model = value.pertinent;
                  model._id = model.name.toLowerCase();
                  model.dbid = key;
                  app.interactions.add(model, {merge: true});
                  return model._id;
                }
                if (key.substr(0, 1) === 'a') {
                  return new Promise(function (resolve, reject) {
                    model = {
                      _id: window.BMP.BIC.siteVars.answerSpace.toLowerCase(),
                      dbid: key
                    };
                    app.interactions.add(model, {merge: true});
                    app.save(value.pertinent, {
                      success: function () {
                        resolve(window.BMP.BIC.siteVars.answerSpace.toLowerCase());
                      },
                      error: reject
                    });
                  });
                }
              })));
            }
          )
          .then(
            function (interactions) {
              return Promise.all(_.map(
                _.reject(app.interactions.models, function (model) {
                  return _.contains(interactions, model.id);
                }),
                function (model) {
                  return new Promise(function (resolve, reject) {
                    model.destroy({
                      success: resolve,
                      error: reject
                    });
                  });
                }
              ));
            }
          )
          .then(
            function () {
              return Promise.all(_.map(_.compact(_.uniq(app.interactions.pluck('xml'))), function (element) {
                return new Promise(function (resolve, reject) {
                  if (!app.datasuitcases.get(element)) {
                    app.datasuitcases.add({_id: element});
                    app.datasuitcases.get(element).populate().then(resolve,resolve);
                  } else {
                    app.datasuitcases.get(element).populate().then(resolve, resolve);
                  }
                });
              }));
            }
          )
          .then(
            function () {
              return app.datasuitcases.save();
            }
          )
          .then(
            function () {
              return app.interactions.save();
            }
          );
      },

      checkLoginStatus: function () {
        //false
        var app = this;

        return new Promise(function (resolve) {
          API.getLoginStatus().then(function (data) {
            var status = data.status || data;
            if (app.get('loginStatus') !== status) {
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
          $(document).one('pageshow', function () {
            if (window.BootStatus && window.BootStatus.notifySuccess) {
              window.BootStatus.notifySuccess();
            }
            $('#temp').remove();
          });
        });
      }
    });

    window.BMP.BIC3 = new Application();

    window.BMP.BIC3.history = { length: 0 };

    window.onpopstate = function () {
      window.BMP.BIC3.history.length += 1;
    };

    window.BMP.BIC3.version = '3.1.15';

    return window.BMP.BIC3;
  }
);
