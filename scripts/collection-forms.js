/*jslint sub:true*/ // we need to use obj['prop'] instead of obj.prop for IE8
define(
  ['model-form', 'feature!data'],
  function (Form, Data) {
    "use strict";
    var FormCollection = Backbone.Collection.extend({
      model: Form,

      initialize: function () {
        var collection = this;
        collection.initialize = new $.Deferred();
        collection.data = new Data(window.BMP.BIC.siteVars.answerSpace + '-Form');
        collection.fetch({
          success: function () {
            collection.initialize.resolve();
          },
          error: function () {
            collection.initialize.reject();
          }
        });

        require(['api'], function (API) {
          API.getForm().done(function (data) {
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
        });

        collection.on("reset", function () {
          collection.data.deleteAll();
        });

        BlinkForms.getDefinition = function (name, action) {
          var dfrd = new $.Deferred();
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

            //def = _.clone(def.attributes);
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

            if (!action) {
              dfrd.resolve(def['default']);
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
            dfrd.resolve(def['default']);
          });
          return dfrd.promise();
        };
      }
    });
    return FormCollection;
  }
);
