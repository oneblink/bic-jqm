define(
  [],
  function () {
    "use strict";
    var FormRecord = Backbone.Model.extend({
      idAttribute: "_id",

      url: function (action) {
        return '/_R_/common/3/xhr/GetFormRecord.php?_fn=' + this.get('formName') + '&_tid=' + this.get('id') + '&action=' + action;
      },

      httpMethod: 'read',

      parse: function (response) {
        var nodes, node, record;

        record = {};
        nodes = response.evaluate('//' + this.get('formName'), response);
        node = nodes.iterateNext();

        _.each(node.children, function (key) {
          record[key.nodeName] = key.innerHTML;
        });

        return {
          record: record,
          contentTime: Date.now()
        };
      }
    });

    return FormRecord;
  }
);

