define(function (require) {
  'use strict';

  // foreign modules

  var promisedRequire = require('@jokeyrhyme/promised-requirejs');

  // local modules

  var c = require('bic/console');

  // this module

  var Forms;

  require('bic/promise'); // ensure `global.Promise` exists before starting

  function getDefinition (name, action) {
    var app = window.BMP.BIC;
    var formDefinition;

    return app.forms.whenUpdated()
    .then(function () {
      return new Promise(function (resolve, reject) {
        var def = app.forms.get(name);
        var err;
        if (!def) {
          c.error('BMP.Forms.getDefinition():');
          err = new Error('unable to locate "' + name + '" definition');
          c.error(err);
          return reject(err);
        }

        try {
          formDefinition = Forms.flattenDefinition(def.attributes, action);
          // BlinkForms.flattenDefinition returns a non backbone object
          // so lets make sure that the leave interactions defined exist on it, so
          // BlinkForms will use them when creating the form model.
          if (def.get('onFormLeaveInteraction')) {
            formDefinition.onFormLeaveInteraction = def.get('onFormLeaveInteraction');
          }
          resolve(formDefinition);
        } catch (defErr) {
          c.error('BMP.Forms.getDefinition():');
          c.error(defErr);
          reject(defErr);
        }
      });
    });
  }

  return function () {
    return promisedRequire('BlinkForms')
    .then(function (mod) {
      Forms = mod;

      // export to global, expected by Expressions
      window.BMP.Forms = window.BMP.Forms || mod;

      // BlinkForms expects this function to be defined by whatever is using it.
      // otherwise, subforms will fall over.
      Forms.getDefinition = Forms.getDefinition || getDefinition;

      // we need to explicitly load "forms/jqm"
      // otherwise sometimes the final Promise is resolved before we are ready
      return promisedRequire('forms/jqm');
    })
    .then(function () {
      return promisedRequire('bic/form-expressions');
    })
    .then(function (mod) {
      if (BMP.Expression && BMP.Expression.fn) {
        BMP.Expression.fn.interaction = mod.interaction;
        BMP.Expression.fn.suitcase = mod.suitcase;
      }
      // consumers of this module expect it to resolve with Forms
      return Promise.resolve(Forms);
    });
  };
});
