define(
  ['model-form-record', 'feature!data', 'api'],
  function (FormRecord, Data, API) {
    'use strict';
    var FormRecordCollection = Backbone.Collection.extend({
      model: FormRecord,

      datastore: function () {
        this.data = new Data(window.BMP.BIC.siteVars.answerSpace.toLowerCase() + '-FormRecord');
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

      pull: function (formName) {
        var collection = this;

        return new Promise(function (resolve, reject) {
          API.getFormList(formName).then(
            function (data) {
              var nodes, node, parsed, parseNodes;

              nodes = data.evaluate('//' + formName, data);
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
                parsed.formName = formName;
                parsed.list = {};

                _.each(node.children, parseNodes);

                parsed._id = formName + '-' + parsed.id;

                collection.add(parsed, {merge: true});
                node = nodes.iterateNext();
              }

              resolve();
            },
            function () {
              reject();
            }
          );
        });
      }
    });
    return FormRecordCollection;
  }
);
