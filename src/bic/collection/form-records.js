define(function (require) {
  'use strict';

  // foreign modules

  var $ = require('jquery');
  var _ = require('underscore');
  var Promise = require('bic/promise');

  // local modules

  var API = require('bic/api');
  var Collection = require('bic/collection');
  var FormRecord = require('bic/model/form-record');
  var parseFormChildXML = require('bic/lib/parse-form-child-xml');

  // this module

  var NAME = window.BMP.BIC.siteVars.answerSpace.toLowerCase() + '-FormRecord';

  var FormRecordCollection = Collection.extend({
    model: FormRecord,

    datastore: function () {
      return Collection.prototype.datastore.call(this, NAME);
    },

    /**
     * Gets a list of records for the specified formName
     * @param  {string} formName - The name of the form to get
     * @return {Promise} - Resolved when the server returns the list or rejected if the request fails
     */
    pull: function (formName) {
      var collection = this;

      return new Promise(function (resolve, reject) {
        API.getFormList(formName).then(
          function (data) {
            var $forms = $(formName, data);

            collection.reset();

            $forms.each(function (index, node) {
              var formElement = {
                formName: formName,
                list: {}
              };

              $(node).children().each(function (index, nodeChild) {
                var $nodeChild = $(nodeChild);

                if ($nodeChild.prop('nodeName') === 'id') {
                  formElement.id = $nodeChild.text();
                  formElement._id = formName + '-' + formElement.id;
                  return;
                }

                _.extend(formElement.list, parseFormChildXML(nodeChild));
              });

              collection.add(formElement, {merge: true});
            });

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
