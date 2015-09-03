define(function (require) {
  'use strict';

  // foreign modules

  var $ = require('jquery');
  var _ = require('underscore');
  var Backbone = require('backbone');

  // local modules

  var API = require('bic/api');
  var parseFormChildXML = require('bic/lib/parse-form-child-xml');

  // this module
  return Backbone.Model.extend({
    idAttribute: '_id',

    populate: function (action, callback) {
      var model = this;
      var formName = model.get('formName');
      API.getFormRecord(formName, action, model.get('id')).then(
        function (data) {
          var record = {};

          $(formName, data).children().each(function (index, nodeChild) {
            _.extend(record, parseFormChildXML(nodeChild));
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
});
