/*jslint sub:true*/ // we need to use obj['prop'] instead of obj.prop for IE8
define(
  ['model-form', 'feature!data', 'feature!api'],
  function (Form, Data, API) {
    "use strict";
    var FormCollection = Backbone.Collection.extend({
      model: Form,

      initialize: function () {
        if (!BlinkForms) {
          window.BlinkForms = {};
        }
        BlinkForms.getDefinition = function (name, action) {
          return new Promise(function (resolve, reject) {
            require(['model-application'], function (app) {
              var def = app.forms.get(name),
                elements,
                elNames,
                collapseAction = function (d) {
                  var attrs = d['default'] || {};
                  if (action && d[action]) {
                    _.extend(attrs, d[action]);
                  }
                  return attrs;
                };

              if (!def) {
                return reject();
              }

              def = JSON.parse(JSON.stringify(def.attributes));

              if (_.isArray(def['default']._elements)) {
                def['default']._elements = _.map(def['default']._elements, collapseAction);
              }
              if (_.isArray(def['default']._sections)) {
                def['default']._sections = _.map(def['default']._sections, collapseAction);
              }
              if (_.isArray(def['default']._pages)) {
                def['default']._pages = _.map(def['default']._pages, collapseAction);
              }
              if (_.isArray(def['default']._behaviours)) {
                def['default']._behaviours = _.map(def['default']._behaviours, collapseAction);
              }
              if (_.isArray(def['default']._checks)) {
                def['default']._checks = _.map(def['default']._checks, collapseAction);
              }
              if (_.isArray(def['default']._actions)) {
                def['default']._actions = _.map(def['default']._actions, collapseAction);
              }

              if (!action) {
                resolve(def['default']);
                return;
              }

              if (def[action] && def[action]._elements) {
                elements = def['default']._elements;
                delete def['default']._elements;
                elNames = def[action]._elements;
                delete def[action]._elements;
                _.extend(def['default'], def[action]);

                // remove all elements not needed for this action
                elements = _.filter(elements, function (el) {
                  return elNames.indexOf(el.name) !== -1;
                });
                // sort elements as per the action-specific order
                elements = _.sortBy(elements, function (el) {
                  return elNames.indexOf(el.name);
                });

                def['default']._elements = elements;
              }
              resolve(def['default']);
            });
          });
        };
      },

      datastore: function () {
        this.data = new Data(window.BMP.BIC.siteVars.answerSpace + '-Form');
        return this;
      },

      load: function () {
        var collection = this;

        return new Promise(function (resolve, reject) {
          collection.fetch({
            success: resolve,
            error: reject
          });
        });
      },

      download: function () {
        var collection = this;
        API.getForm().then(function (data) {
          _.each(data, function (recordData) {
            var record = JSON.parse(recordData),
              preExisting = collection.findWhere({_id: record['default'].name});
            if (preExisting) {
              preExisting.set(record).save();
            } else {
              record._id = record['default'].name;
              collection.create(record);
            }
          });
        });
      },

      events: function () {
        var collection = this;

        collection.on("reset", function () {
          collection.data.deleteAll();
        });

        return this;
      }

    });
    return FormCollection;
  }
);
