define(
  ['wrapper-backbone', 'model-form-mobile', 'BlinkForms', 'jquery', 'underscore'],
  function (Backbone, Form, BlinkForms, $, _) {
    "use strict";
    var FormCollection = Backbone.Collection.extend({
      model: Form,

      initialize: function () {
        var collection = this;

        BlinkForms.getDefinition = function (name, action) {
          var dfrd = new $.Deferred();
          require(['model-application-mobile'], function (app) {
            var def = app.forms.get(name).get('definition'),
              collapsed,
              elements,
              elNames,
              collapseAction = function (d) {
                var attrs = d.default || {};
                if (action && d[action]) {
                  _.extend(attrs, d[action]);
                }
                return attrs;
              };

            // This is a safety feature, like goggles on a paintball range
            // If you take your mask off, your going to have a bad time
            def = JSON.parse(JSON.stringify(def));

            if (_.isArray(def.default._elements)) {
              def.default._elements = _.map(def.default._elements, collapseAction);
            }
            if (_.isArray(def.default._sections)) {
              def.default._sections = _.map(def.default._sections, collapseAction);
            }
            if (_.isArray(def.default._pages)) {
              def.default._pages = _.map(def.default._pages, collapseAction);
            }

            if (!action) {
              dfrd.resolve(def.default);
            }

            if (def[action] && def[action]._elements) {
              elements = def.default._elements;
              delete def.default._elements;
              elNames = def[action]._elements;
              delete def[action]._elements;
              _.extend(def.default, def[action]);

              // remove all elements not needed for this action
              elements = _.filter(elements, function (el) {
                return elNames.indexOf(el.name) !== -1;
              });
              // sort elements as per the action-specific order
              elements = _.sortBy(elements, function (el) {
                return elNames.indexOf(el.name);
              });

              def.default._elements = elements;
            }
            dfrd.resolve(def.default);
          });
          return dfrd.promise();
        };
      }
    });
    return FormCollection;
  }
);
