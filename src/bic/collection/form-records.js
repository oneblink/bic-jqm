define(function (require) {
  'use strict';

  // foreign modules

  var _ = require('underscore');
  var Promise = require('feature!promises');


  // local modules

  var API = require('bic/api');
  var Collection = require('bic/collection');
  var FormRecord = require('bic/model-form-record');

  // this module

  var NAME = window.BMP.BIC.siteVars.answerSpace.toLowerCase() + '-FormRecord';

  var FormRecordCollection = Collection.extend({
    model: FormRecord,

    datastore: function () {
      return Collection.prototype.datastore.call(this, NAME);
    },

    pull: function (formName) {
      var collection = this;

      return new Promise(function (resolve, reject) {
        API.getFormList(formName).then(
          function (data) {
            var nodes, node, parsed, parseNodes;

            collection.reset();

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
});
