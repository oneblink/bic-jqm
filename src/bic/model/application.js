/**
  window.BMP.BIC

  The Blink Intelligent Client

  @module BIC
*/
define(function (require) {
  'use strict';

  // foreign modules

  var $ = require('jquery');
  var _ = require('underscore');
  var Backbone = require('backbone');
  var Promise = require('bic/promise');

  // local modules

  var InteractionCollection = require('bic/collection/interactions');
  var DataSuitcaseCollection = require('bic/collection/datasuitcases');
  var FormCollection = require('bic/collection/forms');
  var PendingCollection = require('bic/collection/pending');
  var FormRecordsCollection = require('bic/collection/form-records');
  var StarsCollection = require('bic/collection/stars');

  var c = require('bic/console');
  var facade = require('bic/facade');
  var API = require('bic/api');
  var metaStore = require('bic/store-meta');
  var loadForms = require('bic/promise-forms');

  // this module

  var singleton, Application;

  require('jquerymobile');

  /**
    The Blink Intelligent Client

    @class
    @alias window.BMP.BIC
  */
  Application = Backbone.Model.extend({

    idAttribute: '_id',

    defaults: {
      _id: window.BMP.BIC.siteVars.answerSpace.toLowerCase(),
      loginStatus: false,
      displayErrorSummary: true
    },

    /**
      Takes a user to an interaction.

      @param {string} interactionPath The url path to the interaction,
      relative to the answer space. A falsy value will take you to home.
      A preceeding slash can be ommitted

      @example <caption>Both of these will take you to the same place.</caption>
      window.BMP.BIC.goToInteraction('shops/review/add_review');
      window.BMP.BIC.goToInteraction('/shops/review/add_review');
    */
    goToInteraction: function (interactionPath) {
      var answerSpace = this.get('siteName') || '';

      interactionPath = _.compact((interactionPath || '').split('/'));
      if (!interactionPath.length || interactionPath[0].toLowerCase() !== answerSpace.toLowerCase()) {
        interactionPath.unshift(answerSpace);
      }

      $.mobile.changePage('/' + interactionPath.join('/'));
    },

    hasHomeInteraction: function () {
      var app = this;
      if (app.has('homeScreen') && app.get('homeScreen') !== false && app.has('homeInteraction')) {
        return true;
      }
      return false;
    },

    collections: function () {
      var app = this;

      if (this.collections._promise) {
        // return a cached promise when possible
        return this.collections._promise;
      }

      this.collections._promise = new Promise(function (resolve, reject) {

        app.interactions = app.interactions || new InteractionCollection();
        app.datasuitcases = app.datasuitcases || new DataSuitcaseCollection();
        app.forms = app.forms || new FormCollection();
        app.stars = app.stars || new StarsCollection();
        app.formRecords = app.formRecords || new FormRecordsCollection();

        // prime models / collections with previous persisted data
        Promise.all([
          // loading these causes storage detection results to be finalised
          app.interactions.datastore().load(),
          app.datasuitcases.datastore().load(),
          app.forms.datastore().load(),
          app.stars.datastore().load(),
          app.formRecords.datastore().load()
        ])
        .then(function () {
          // now it is safe to use .hasStorage()
          if (app.hasStorage()) {
            // enable the pending queue
            app.pending = app.pending || new PendingCollection();
            return app.pending.datastore().load();
          }
          return Promise.resolve();
        })
        .then(resolve, reject);

      });

      return this.collections._promise;
    },

    setup: function () {
      var app = this;

      facade.subscribe('applicationModel', 'loggedIn', function () {
        app.set('loginStatus', 'LOGGED IN');
        app.trigger('loginProcessed');
      });

      facade.subscribe('applicationModel', 'loggedOut', function () {
        app.set('loginStatus', 'LOGGED OUT');
        app.trigger('loginProcessed');
      });

      c.log('app.setup(): done');
      return Promise.resolve();
    },

    populate: function () {
      var app = this;

      if (!(navigator.onLine || BMP.BlinkGap.isHere())) {
        c.debug('app.populate(): quit early');
        return Promise.resolve();
      }

      return app.collections()
        .then(null, function () {
          return null;
        })
        .then(function () {
          return Promise.resolve(API.getAnswerSpaceMap());
        })
        .then(
          function (data) {
            if (data && typeof data === 'string') {
              try {
                data = JSON.parse(data);
              } catch (err) {
                /* eslint-disable no-console */
                console.error('unable to parse answerSpace map');
                console.error(err);
                /* eslint-enable no-console */
              }
            }
            return Promise.all(_.compact(_.map(data, function (value, key) {
              var model;
              model = value.pertinent;
              if (!model) {
                return null; // e.g. "map" property of GetConfig XHR JSON
              }
              model.dbid = key;
              if (key.substr(0, 1) === 'c' || key.substr(0, 1) === 'i') {
                model._id = model.name.toLowerCase();
                app.interactions.add(model, {merge: true});
                return model._id;
              }
              if (key.substr(0, 1) === 'a') {
                model._id = window.BMP.BIC.siteVars.answerSpace.toLowerCase();
                return new Promise(function (resolve) {
                  app.interactions.add(model, {merge: true});
                  app.set(model);
                  resolve(window.BMP.BIC.siteVars.answerSpace.toLowerCase());
                });
              }
            })));
          }
       )
        .then(
          function (interactions) {
            return Promise.all(
              _.map(
                _.reject(app.interactions.models, function (model) {
                  return _.contains(interactions, model.id);
                }
             ),
              function (model) {
                if (!app.hasStorage()) {
                  app.interactions.remove(model);
                  return Promise.resolve();
                }
                return new Promise(function (resolve, reject) {
                  model.destroy({
                    success: resolve,
                    error: reject
                  });
                });
              }
           ));
          }
       )
        .then(
          function () {
            loadForms();
            app.forms.whenUpdated();
            app.retrieveDataSuitcasesForInteractions();
            c.log('app.populate(): done');
            c.debug('app.populate(): interactions.length: ' + app.interactions.length);
            if (!app.hasStorage()) {
              return Promise.resolve();
            }
            return app.interactions.save();
          }
       );
    },

    retrieveDataSuitcasesForInteractions: function () {
      var app = this;
      return Promise.all(
        _.map(_.compact(_.uniq(app.interactions.pluck('xml'))),
        function (element) {
          return new Promise(function (resolve) { // args.[1] 'reject'
            if (!app.datasuitcases.get(element)) {
              app.datasuitcases.add({_id: element});
              app.datasuitcases.get(element).populate().then(resolve, resolve);
            } else {
              app.datasuitcases.get(element).populate().then(resolve, resolve);
            }
          });
        })
     )
      .then(function () {
        return app.datasuitcases.save();
      });
    },

    whenPopulated: function () {
      var me = this;
      return new Promise(function (resolve, reject) {
        me.collections().then(function () {
          var timeout;
          if (me.interactions.length) {
            c.info('app.whenPopulated(): done');
            resolve();
          } else {
            me.interactions.once('add', function () {
              clearTimeout(timeout);
              c.info('app.whenPopulated(): done');
              resolve();
            });
            timeout = setTimeout(function () {
              c.error('app.whenPopulated(): timeout');
              reject(new Error('whenPopulated timed out after 20 seconds'));
            }, 20e3);
          }
        }, function () {
          c.error('app.whenPopulated(): #collections() error');
          reject(new Error('whenPopulated failed due to collections'));
        });
      });
    },

    checkLoginStatus: function () {
      // false
      var app = this;

      return new Promise(function (resolve) {
        API.getLoginStatus().then(function (data) {
          var status = data.status || data;
          if (app.get('loginStatus') !== status) {
            app.populate().then(function () {
              app.set({loginStatus: status});
              resolve();
            });
          } else {
            resolve();
          }
        });
      });
    },

    initialRender: function () {
      var app = this;

      $.mobile.defaultPageTransition = app.get('defaultTransition');
      $.mobile.changePage($.mobile.path.parseLocation().href, {
        changeHash: false,
        reloadPage: true,
        transition: 'fade'
      });
      $(document).one('pageshow', function () {
        if (window.BootStatus && window.BootStatus.notifySuccess) {
          window.BootStatus.notifySuccess();
        }
        $('#temp').remove();
      });
    },

    hasStorage: function () {
      var col = this.interactions;
      if (col && col.data && col.data.ready && col.data.hasStorage) {
        return col.data.hasStorage();
      }
      c.warn('hasStorage() called before detection complete');
      return false;
    }

  });

  singleton = new Application();

  if (window.BMP.BIC) {
    $.extend(singleton, window.BMP.BIC);
  }

  singleton.history = { length: 0 };

  window.onpopstate = function () {
    singleton.history.length += 1;
  };

  singleton.meta = metaStore;

  singleton.views = {
    FormControls: null,
    FormList: null,
    FormErrorSummary: null,
    FormPending: null
  };

  return singleton;
});
