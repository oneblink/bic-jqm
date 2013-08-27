define(
  ['collection-interactions', 'collection-datasuitcases', 'collection-forms', 'collection-pending', 'feature!data', 'api', 'collection-stars'],
  function (InteractionCollection, DataSuitcaseCollection, FormCollection, PendingCollection, Data, API, StarsCollection) {
    "use strict";
    var Application = Backbone.Model.extend({

      initialize: function () {
        var app = this;

        app.initialize = new $.Deferred();

        this.set({
          _id: window.BMP.BIC.siteVars.answerSpace
        });

        this.on('change', this.update);

        this.data = new Data(window.BMP.BIC.siteVars.answerSpace + '-AnswerSpace');

        this.interactions = new InteractionCollection();
        this.datasuitcases = new DataSuitcaseCollection();
        this.forms = new FormCollection();
        this.pending = new PendingCollection();
        this.stars = new StarsCollection();

        $.when(
          this.interactions.initialize,
          this.datasuitcases.initialize,
          this.forms.initialize,
          this.pending.initialize,
          this.stars.initialize
        ).then(function () {
          app.initialize.resolve();
        });
      },

      idAttribute: "_id",

      defaults: {
        loginStatus: false
      },

      populate: function () {
        var app = this,
          dfrd = new $.Deferred(),
          promise = dfrd.promise();

        API.getAnswerSpaceMap().then(
          function (data) {
            var models = [];
            _.each(data, function (value, key) {
              var model;
              if (key.substr(0, 1) === 'c' || key.substr(0, 1) === 'i') {
                model = value.pertinent;
                model._id = model.name;
                model.dbid = key;
                models.push(model);
              }
              if (key.substr(0, 1) === 'a') {
                model = {
                  _id: window.BMP.BIC.siteVars.answerSpace,
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
            dfrd.resolve();
          },
          function () {
            dfrd.reject();
          }
        );
        return promise;
      },

      checkLoginStatus: function () {
        //false
        var app = this,
          dfrd = $.Deferred();

        API.getLoginStatus().then(function (data) {
          var status = data.status || data;
          if (app.get('loginStatus') !== status) {
            app.interactions.reset();
            app.datasuitcases.reset();
            app.forms.reset();
            app.populate().then(function () {
              app.set({loginStatus: status});
              dfrd.resolve();
            });
          } else {
            dfrd.resolve();
          }
        });

        return dfrd.promise();
      }
    });

    window.BMP.BIC3 = new Application();

    return window.BMP.BIC3;
  }
);
