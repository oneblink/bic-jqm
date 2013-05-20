define(
  ['wrapper-backbone', 'collection-interactions-mobile', 'collection-datasuitcases-mobile', 'model-datasuitcase-mobile', 'collection-forms-mobile', 'model-form-mobile', 'underscore', 'collection-pending', 'data-pouch', 'api-php', 'jquery', 'collection-stars-mobile'],
  function (Backbone, InteractionCollection, DataSuitcaseCollection, DataSuitcase, FormCollection, Form, _, PendingCollection, Data, API, $, StarsCollection) {
    "use strict";
    var Application = Backbone.Model.extend({

      initialize: function () {
        var app = this,
          promises = [],
          interactions = new $.Deferred(),
          datasuitcases = new $.Deferred(),
          forms = new $.Deferred(),
          pending = new $.Deferred(),
          stars = new $.Deferred();

        promises.push(interactions.promise(), datasuitcases.promise(), forms.promise(), pending.promise(), stars.promise());

        this.on('change', this.update);

        this.data = new Data(window.BMP.siteVars.answerSpace + '-AnswerSpace');

        this.interactions = new InteractionCollection().once('initialize', function () {
          interactions.resolve();
        });

        this.datasuitcases = new DataSuitcaseCollection().once('initialize', function () {
          datasuitcases.resolve();
        });

        this.forms = new FormCollection().once('initialize', function () {
          forms.resolve();
        });

        this.pending = new PendingCollection().once('initialize', function () {
          pending.resolve();
        });

        this.stars = new StarsCollection().once('initialize', function () {
          stars.resolve();
        });

        $.when.apply($, promises).then(function () {
          app.trigger("initialize");
        });
      },

      idAttribute: "_id",

      update: function () {
        // var modelArray,
        //   count,
        //   model,
        //   children = {
        //     DataSuitcases: this.datasuitcases,
        //     Forms: this.forms
        //   };

        // _.each(children, function (element, index, list) {
        //   if (this.has(index)) {
        //     modelArray = this.get(index);
        //     for (count = 0; count < modelArray.length; count = count + 1) {
        //       if (element.where({name: modelArray[count]}).length === 0) {
        //         switch (index) {
        //         case "DataSuitcases":
        //           element.create({
        //             _id: modelArray[count],
        //             siteName: this.get("siteName"),
        //             BICtype: "DataSuitcase"
        //           });
        //           break;
        //         case "Forms":
        //           element.create({
        //             _id: modelArray[count],
        //             siteName: this.get("siteName"),
        //             BICtype: "Form"
        //           });
        //           break;
        //         }
        //         //element.create(model);
        //         //model.fetch();
        //       }
        //     }
        //   }
        // }, this);
      },

      populate: function () {
        var app = this,
          dfrd = new $.Deferred(),
          promise = dfrd.promise();

        API.getAnswerSpaceMap().then(
          function (data, textStatus, jqXHR) {
            var models = [];
            _.each(data, function (value, key, list) {
              var model;
              if (key.substr(0, 1) === 'c' || key.substr(0, 1) === 'i') {
                model = value.pertinent;
                model._id = model.name;
                model.dbid = key;
                models.push(model);
              }
              if (key.substr(0, 1) === 'a') {
                model = {
                  _id: window.BMP.siteVars.answerSpace,
                  dbid: key
                };
                models.push(model);

                app.save(value.pertinent);
              }
            }, app);

            app.interactions.set(models).save();
            _.each(_.compact(_.uniq(app.interactions.pluck('xml'))), function (element, index, list) {
              if (!app.datasuitcases.get(element)) {
                app.datasuitcases.create({_id: element}, {success: function (model, resp, options) {
                  model.populate();
                }});
              }
            });

            _.each(_.compact(_.uniq(app.interactions.pluck('blinkFormObjectName'))), function (element, index, list) {
              if (!app.forms.get(element)) {
                app.forms.create({_id: element}, {success: function (model, resp, options) {
                  model.populate();
                }});
              }
            });
            app.trigger("initialize");
            dfrd.resolve();
          },
          function (jqXHR, textStatus, errorThrown) {
            dfrd.reject();
          }
        );
        return promise;
      }
    }),
      app;

    app = new Application();

    return app;
  }
);
