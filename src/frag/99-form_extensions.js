/**
 * Created by ashish on 8/05/2015.
 */
/*eslint-env browser, node*/

  define('form-dependencies',
    ['bic'],
    function (app) {
      'use strict';

      if (BMP.Expression && BMP.Expression.fn) {
        BMP.Expression.fn.interaction = function (interaction, queryString) {
          return new Promise(function (resolve, reject) {
            var nav,
              interactionOptions;
            //if interaction is undefined just reject
            if (!interaction) {
              reject(new Error("no interaction name"));
            }

            //if queryString doesn't have question mark at front, add it
            if (queryString && queryString.substr(0, 1) === "?") {
              queryString = "?" + queryString;
            }

            //if interaction doesn't carry slash / in it, add it
            if (interaction.substr(0, 1) !== "/") {
              interaction = "/" + interaction;
            }
            //this removes very first character for given interaction, so previous process
            nav = $.mobile.path.parseUrl(interaction);
            interactionOptions = app.router.inheritanceChain(nav);
            //if queryString is available, set args
            if (queryString) {
              app.router.parseArgs(queryString, interactionOptions);
            }
            //fetch interaction content
            interactionOptions.prepareForView(nav).then(function (model) {
              //if found interaction, resolve it with content
              resolve(model.attributes.content);
            }, function (err) {
              //reject in case of errors
              reject(err);
            });
          });
        };

        BMP.Expression.fn.suitcase = function (suitcase) {
          return new Promise(function (resolve, reject) {
            var data;
            //if suitcase name is not provided
            if (!suitcase) {
              reject(new Error("no dataSuitcase name"));
            }

            //try to fetch suitcase
            data = app.datasuitcases.get(suitcase);
            if (data) {
              //if suitcase found, return it's data
              resolve(data.attributes.data);
            } else {
              //else reject the promise
              reject(new Error('no dataSuitcase found with name: "' + suitcase + '"'));
            }
          });
        };
      }
    });
  require(['form-dependencies']);
