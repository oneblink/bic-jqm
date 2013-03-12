define(
  ['data/data', 'BlinkForms', 'underscore', 'models/v3/application'],
  function (Backbone, BlinkForms, _, app) {
    "use strict";
    var Forms = Backbone.Model.extend({
      initialize: function () {
        BlinkForms.getDefinition = function (name, action) {
          var definition = app.forms.where({name: name})[0].get('definition'),
            collapseAction,
            collapsed;

          console.log(definition);

          return definition.default;

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

          collapsed.default._elements = _.map(definition.default._elements, collapseAction);
          return collapsed.default;
        };
      },

      getForm: function (name, action) {
        BlinkForms.initialize(BlinkForms.getDefinition(name, action));
        return BlinkForms.currentFormObject;
      }
    }),
      forms;

    forms = new Forms();

    return forms;
  }
);
