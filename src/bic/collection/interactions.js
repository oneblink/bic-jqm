define(function (require) {
  'use strict';

  var _ = require('underscore');

  // local modules

  var Collection = require('bic/collection');
  var Interaction = require('bic/model/interaction');

  // this module

  var NAME = window.BMP.BIC.siteVars.answerSpace.toLowerCase() + '-Interaction';

  var InteractionCollection = Collection.extend({

    model: Interaction,

    datastore: function () {
      return Collection.prototype.datastore.call(this, NAME);
    },

    comparator: 'order',

    /**
     * returns a has of actions for the requested _formName_
     * @param  {string} formName - The name of the form defined in the BMP
     * @param {function} [transformer=_.identity] - A function to transform the data for formName. defaults to an identity function
     * @return {Object}          - Keys are actions ('add', 'edit' etc), values are interactions run through the transformation function
     */
    getFormActions: function (formName, transformer) {
      transformer = transformer || _.identity;

      return this.reduce(function (formHash, interaction) {
        if (interaction.get('blinkFormObjectName') === formName) {
          formHash[interaction.get('blinkFormAction')] = transformer(interaction);
        }

        return formHash;
      }, {});
    }

  });

  return InteractionCollection;
});
