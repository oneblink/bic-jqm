/**
  window.BMP.BIC

  The Blink Intelligent Client

  @module BIC
*/
define(
  ['facade', 'collection-interactions', 'collection-datasuitcases', 'collection-forms', 'collection-pending', 'feature!data', 'feature!api', 'collection-stars', 'domReady', 'collection-form-records'],
  function (facade, InteractionCollection, DataSuitcaseCollection, FormCollection, PendingCollection, Data, API, StarsCollection, domReady, FormRecordsCollection) {
    'use strict';

    /**
      The Blink Intelligent Client

      @class
      @alias window.BMP.BIC
    */
    var Application = Backbone.Model.extend({

      idAttribute: '_id',

      defaults: {
        _id: window.BMP.BIC.siteVars.answerSpace.toLowerCase(),
        loginStatus: false
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
      goToInteraction: function(interactionPath){
        var answerSpace = this.get('siteName') || '';

        interactionPath = _.compact((interactionPath || '').split('/'));
        if ( !interactionPath.length || interactionPath[0].toLowerCase() !== answerSpace.toLowerCase()){
          interactionPath.unshift(answerSpace);
        }

        $.mobile.changePage('/' + interactionPath.join('/'));
      },

      datastore: function () {
        this.data = new Data(window.BMP.BIC.siteVars.answerSpace.toLowerCase() + '-AnswerSpace');
        return this;
      },

      collections: function () {
        var app = this;

        if (this.collections._promise) {
          // return a cached promise when possible
          return this.collections._promise;
        }

        this.collections._promise = new Promise(function (resolve, reject) {
          pollUntil(function () {
            // need to wait for the data layer to be configured RE: cordova
            return !!app.data;
          }, null, function () {
            // now data is safe to use, so we can get started

            if (BMP.Authentication) {
              app.meta = new Data(window.BMP.BIC.siteVars.answerSpace.toLowerCase() + '-Meta');
              BMP.Authentication.getRecord = function (callback) {
                app.meta.read({
                  id: 'offlineLogin'
                }).then(
                  function (data) {
                    callback(null, data.attributes);
                  },
                  function (err) {
                    callback(err);
                  }
                );
              };
              BMP.Authentication.setRecord = function (data, callback) {
                var model = {};
                model.id = 'offlineLogin';
                model.toJSON = function () {
                  return model.attributes;
                };
                model.attributes = data;
                model.attributes._id = model.id;

                app.meta.read({
                  id: model.id
                }).then(
                  function () {
                    app.meta.delete({
                      id: model.id
                    }).then(
                      function () {
                        app.meta.create(model).then(
                          function (document) {
                            callback(null, document);
                          },
                          function (err) {
                            callback(err);
                          }
                        );
                      },
                      function (err) {
                        callback(err);
                      }
                    );
                  },
                  function () {
                    app.meta.create(model).then(
                      function (document) {
                        callback(null, document);
                      },
                      function (err) {
                        callback(err);
                      }
                    );
                  }
                );
              };
            }

            app.interactions = app.interactions || new InteractionCollection();
            app.datasuitcases = app.datasuitcases || new DataSuitcaseCollection();
            app.forms = app.forms || new FormCollection();
            app.stars = app.stars || new StarsCollection();
            app.formRecords = app.formRecords || new FormRecordsCollection();

            if (app.hasStorage()) {
              // enable the pending queue
              app.pending = app.pending || new PendingCollection();

              // prime models / collections with previous persisted data
              Promise.all([
                app.interactions.datastore().load(),
                app.datasuitcases.datastore().load(),
                app.forms.datastore().load(),
                app.pending.datastore().load(),
                app.stars.datastore().load(),
                app.formRecords.datastore().load()
              ]).then(resolve, reject);

            } else {
              resolve();
            }

          });
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

        return new Promise(function (resolve, reject) {
          app.fetch({
            success: resolve,
            error: reject
          });
        });
      },

      populate: function () {
        var app = this;

        if (!(navigator.onLine || BMP.BlinkGap.isHere())) {
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
                  /*eslint-disable no-console*/
                  console.error('unable to parse answerSpace map');
                  console.error(err);
                  /*eslint-enable no-console*/
                }
              }
              return Promise.all(_.compact(_.map(data, function (value, key) {
                var model;
                if (key.substr(0, 1) === 'c' || key.substr(0, 1) === 'i') {
                  model = value.pertinent;
                  model._id = model.name.toLowerCase();
                  model.dbid = key;
                  app.interactions.add(model, {merge: true});
                  return model._id;
                }
                if (key.substr(0, 1) === 'a') {
                  return new Promise(function (resolve, reject) {
                    model = {
                      _id: window.BMP.BIC.siteVars.answerSpace.toLowerCase(),
                      dbid: key
                    };
                    app.interactions.add(model, {merge: true});
                    app.save(value.pertinent, {
                      success: function () {
                        resolve(window.BMP.BIC.siteVars.answerSpace.toLowerCase());
                      },
                      error: reject
                    });
                  });
                }
              })));
            }
          )
          .then(
            function (interactions) {
              return Promise.all(_.map(
                _.reject(app.interactions.models, function (model) {
                  return _.contains(interactions, model.id);
                }),
                function (model) {
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
              app.forms.whenUpdated();
              app.retrieveDataSuitcasesForInteractions();
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
              resolve();
            } else {
              me.interactions.once('add', function () {
                clearTimeout(timeout);
                resolve();
              });
              timeout = setTimeout(function () {
                reject(new Error('whenPopulated timed out after 20 seconds'));
              }, 20e3);
            }
          }, function () {
            reject(new Error('whenPopulated failed due to collections'));
          });
        });
      },

      checkLoginStatus: function () {
        //false
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
        domReady(function () {
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
        });
      },

      hasStorage: function () {
        if (typeof Pouch === 'undefined') {
          return false;
        }
        if (window.BMP.BIC.isBlinkGap === true && Pouch.adapters.websql) {
          return true;
        }
        if (Pouch.adapters.idb) {
          try {
            return Modernizr.indexeddb && window.indexedDB.open('idbTest', 1).onupgradeneeded === null && navigator.userAgent.indexOf('iPhone') === -1 && navigator.userAgent.indexOf('iPad') === -1;
          } catch (ignore) {
            return false;
          }
          return false;
        }
        return false;
      }

    });

    window.BMP.BIC3 = new Application();

    window.BMP.BIC3.history = { length: 0 };

    window.onpopstate = function () {
      window.BMP.BIC3.history.length += 1;
    };

    window.BMP.BIC3.version = '3.3.4';

    // keep BMP.BIC and BMP.BIC3 the same
    $.extend(window.BMP.BIC3, window.BMP.BIC);
    window.BMP.BIC = window.BMP.BIC3;

    return window.BMP.BIC3;
  }
);
