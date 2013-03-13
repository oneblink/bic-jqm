define(
  ['data/data', 'BlinkForms', 'underscore', 'jquery', 'models/v3/application'],
  function (Backbone, BlinkForms, _, $, app) {
    "use strict";
    var Forms = Backbone.Model.extend({
      initialize: function () {
        BlinkForms.getDefinition = function (name, action) {
          var definition = app.forms.where({name: name})[0].get('definition'),
            collapseAction,
            collapsed,
            elements,
            elNames,
            dfrd = $.Deferred();

          collapseAction = function (d) {
            var attrs = d.default || {};
            if (action && d[action]) {
              _.extend(attrs, d[action]);
            }
            return attrs;
          };

          collapsed = {
            default: {
              name: name
            }
          };

          if (_.isArray(definition.default._elements)) {
            collapsed.default._elements = _.map(definition.default._elements, collapseAction);
          }
          if (_.isArray(definition.default._sections)) {
            collapsed.default._sections = _.map(definition.default._sections, collapseAction);
          }
          if (_.isArray(definition.default._pages)) {
            collapsed.default._pages = _.map(definition.default._pages, collapseAction);
          }

          if (!action) {
            console.log(JSON.stringify(collapsed.default))
            dfrd.resolve(collapsed.default);
          }

          if (definition[action] && definition[action]._elements) {
            console.log("action!")
          //   //elements = definition.default._elements;
          //   //delete collapsed.default._elements;
          //   //elNames = definition[action]._elements;
          //   //delete collapsed[action]._elements;
          //   _.extend(collapsed.default, definition[action]);

          //   // remove all elements not needed for this action
          //   elements = _.filter(elements, function(el) {
          //     return elNames.indexOf(el.default.name) !== -1;
          //   });
          //   // sort elements as per the action-specific order
          //   elements = _.sortBy(elements, function(el) {
          //     return elNames.indexOf(el.default.name);
          //   });

          //   def.default._elements = elements;

          }

          dfrd.resolve(collapsed.default);
          return dfrd.promise();
        };
      },

      getForm: function (name, action) {
        BlinkForms.getDefinition(name, action).then(function (definition) {
          BlinkForms.initialize(definition);
        });

        return BlinkForms.currentFormObject;
      }
    }),
      forms;

    forms = new Forms();

    return forms;
  }
);
