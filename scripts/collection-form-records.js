define(
  ['model-form-record', 'feature!data'],
  function (FormRecord, Data) {
    "use strict";
    var FormRecordCollection = Backbone.Collection.extend({
      model: FormRecord,

      datastore: function () {
        this.data = new Data(window.BMP.BIC.siteVars.answerSpace + '-FormRecord');
        return this;
      },

      url: function (formName) {
        return '/_R_/common/3/xhr/GetFormList.php?_asid=' + window.BMP.BIC.siteVars.answerSpaceId + '&_fn=' + formName;
      },

      parse: function (response, options) {
        var collection, nodes, node, parsed, parseNodes;

        collection = this;

        nodes = response.evaluate('//' + options.formName, response);
        node = nodes.iterateNext();

        parseNodes = function (key) {
          if (key.nodeName === 'id') {
            parsed.id = key.innerHTML;
          } else {
            parsed.list[key.nodeName] = key.innerHTML;
          }
        };

        while (node) {
          parsed = {};
          parsed.formName = options.formName;
          parsed.list = {};

          _.each(node.children, parseNodes);

          parsed._id = options.formName + '-' + parsed.id;

          collection.add(parsed, {merge: true});
          node = nodes.iterateNext();
        }
      }
    });
    return FormRecordCollection;
  }
);

