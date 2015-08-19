define(function (require) {
  'use strict';

  // foreign modules

  var _ = require('underscore');
  var Backbone = require('backbone');

  // local modules

  var API = require('bic/api');

  // this module

  var FormRecord = Backbone.Model.extend({
    idAttribute: '_id',

    populate: function (action, callback) {
      var model = this;
      API.getFormRecord(model.get('formName'), action, model.get('id')).then(
        function (data) {
          var nodes, node, record;

          record = {};
          nodes = data.evaluate('//' + model.get('formName'), data, null, XPathResult.ANY_TYPE, null);
          node = nodes.iterateNext();

          _.each(node.childNodes, function (key) {
            if (key.nodeType === key.ELEMENT_NODE) {
              record[key.nodeName] = key.textContent;
            }
          });

          model.set({
            record: record,
            contentTime: Date.now()
          });

          model.save({}, {
            success: callback,
            error: callback
          });
        }
     );
    }
  });

  return FormRecord;
});
