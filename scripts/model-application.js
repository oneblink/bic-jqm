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

      url: function () {
        return '/_R_/common/3/xhr/GetConfig.php';
      },

      httpMethod: 'read',

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
          app.interactions.datastore().events().fetch(),
          app.datasuitcases.datastore().events().fetch(),
          app.forms.datastore().events().fetch(),
          app.pending.datastore().fetch(),
          app.stars.datastore().fetch(),
          app.formRecords.datastore().fetch()
        ]);
      },

      parse: function (response) {
        var app, data;

        app = this;
        data = {};

        _.each(response, function (value, key) {
          var model;
          if (key.substr(0, 1) === 'c' || key.substr(0, 1) === 'i') {
            model = value.pertinent;
            model._id = model.name.toLowerCase();
            model.dbid = key;
            app.interactions.add(model, {merge: true}).save();
          }
          if (key.substr(0, 1) === 'a') {
            model = {
              _id: window.BMP.BIC.siteVars.answerSpace.toLowerCase(),
              dbid: key
            };
            app.interactions.add(model, {merge: true}).save();

            data = value.pertinent;
          }
        }, app);

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

        return data;
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
