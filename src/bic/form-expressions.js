/**
 * Created by ashish on 8/05/2015.
 */
/*eslint-disable vars-on-top*/ // jquerymobile

define(function (require) {
  'use strict';

  // foreign modules

  var $ = require('jquery');
  var Promise = require('bic/promise');
  require('jquerymobile');

  // local modules

  var app = require('bic/model/application');

  // this module

  var mod = {};

  mod.interaction = function (interaction, queryString) {
    return new Promise(function (resolve, reject) {
      var nav,
        interactionOptions;
      // if interaction is undefined just reject
      if (!interaction) {
        reject(new Error('no interaction name'));
      }

      // if queryString doesn't have question mark at front, add it
      if (queryString && queryString.substr(0, 1) === '?') {
        queryString = '?' + queryString;
      }

      // if interaction doesn't carry slash / in it, add it
      if (interaction.substr(0, 1) !== '/') {
        interaction = '/' + interaction;
      }
      // this removes very first character for given interaction, so previous process
      nav = $.mobile.path.parseUrl(interaction);
      interactionOptions = app.router.inheritanceChain(nav);
      // if queryString is available, set args
      if (queryString) {
        app.router.parseArgs(queryString, interactionOptions);
      }
      // fetch interaction content
      interactionOptions.prepareForView(nav).then(function (model) {
        // if found interaction, resolve it with content
        resolve(model.attributes.content);
      }, function (err) {
        // reject in case of errors
        reject(err);
      });
    });
  };

  mod.suitcase = function (suitcase) {
    return new Promise(function (resolve, reject) {
      var data;
      // if suitcase name is not provided
      if (!suitcase) {
        reject(new Error('no dataSuitcase name'));
      }

      // try to fetch suitcase
      data = app.datasuitcases.get(suitcase);
      if (data) {
        // if suitcase found, return it's data
        resolve(data.attributes.data);
      } else {
        // else reject the promise
        reject(new Error('no dataSuitcase found with name: "' + suitcase + '"'));
      }
    });
  };

  if (BMP.Expression && BMP.Expression.fn) {
    BMP.Expression.fn.interaction = mod.interaction;
    BMP.Expression.fn.suitcase = mod.suitcase;
  }

  return mod;
});
