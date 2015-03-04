define(
  ['model-application', 'view-interaction'],
  function (app, InteractionView) {
    'use strict';
    var Router = Backbone.Router.extend({
      initialize: function () {
        BMP.FileInput.initialize();

        app.router = this;

        if (BMP.isBlinkGap) {
          $(document).on('pause', this.suspendApplication);
          $(document).on('resume', this.resumeApplication);
        }

        if (document.hidden !== undefined) {
          $(document).on('visibilitychange', function () {
            if (document.hidden) {
              app.router.suspendApplication();
            } else {
              app.router.resumeApplication();
            }
          });
        }

        $(document).on('pagebeforeload', function (e, data) {
          e.preventDefault();

          // keep track of history depth for forms post-submission behaviour
          window.BMP.BIC3.history.length += 1;

          $.mobile.loading('show');
          app.router.routeRequest(data);
        });

        Promise.resolve(app.datastore())
          .then(function () {
            return app.collections();
          })
          .then(function () {
            return app.setup();
          })
          .then(null, function () {
            return;
          })
          .then(function () {
            // Need to hang around until native offline is ready
            return new Promise(function (resolve, reject) {
              if (BMP.BlinkGap.isHere()) {
                BMP.BlinkGap.waitForOffline(
                  function () {
                    resolve();
                  },
                  function () {
                    reject();
                  }
                );
              } else {
                resolve();
              }
            });
          })
          .then(function () {
            return app.populate();
          })
          .then(null, function () {
            return;
          })
          .then(function () {
            return app.forms.download();
          })
          .then(null, function () {
            return;
          })
          .then(function () {
            return app.initialRender();
          })
          .then(null, function (err) {
            throw err;
          });
      },

      routeRequest: function (data) {
        var path = $.mobile.path.parseUrl(data.absUrl),
          model;

        if (BMP.BlinkGap.isOfflineReady() && path.hrefNoSearch.indexOf(window.cordova.offline.filePathPrex) !== -1) {
          // Remove file path
          path.pathname = path.hrefNoSearch.substr(path.hrefNoSearch.indexOf(window.cordova.offline.filePathPrex) + window.cordova.offline.filePathPrex.length + 1);
          // Remove domain info
          path.pathname = path.pathname.substr(path.pathname.indexOf('/'));
          // Remove file suffix
          path.pathname = path.pathname.substr(0, path.pathname.indexOf('.'));
        }

        app.whenPopulated()
          .then(null, function () {
            return null;
          })
          .then(function () {

            model = app.router.inheritanceChain(path.pathname);

            app.currentInteraction = model;

            app.router.parseArgs(path.search.substr(1), model);

            model.prepareForView(data).then(function (innerModel) {
              new InteractionView({
                tagName: 'div',
                model: innerModel
              }).once('render', function () {
                this.$el.attr('data-url', data.dataUrl);
                this.$el.attr('data-external-page', true);
                this.$el.one('pagecreate', $.mobile._bindPageRemove);
                data.deferred.resolve(data.absUrl, data.options, this.$el);
              }).render(data);
            }, function () {
              data.deferred.reject(data.absUrl, data.options);
              $.mobile.showPageLoadingMsg($.mobile.pageLoadErrorMessageTheme, $.mobile.pageLoadErrorMessage, true);
              setTimeout($.mobile.hidePageLoadingMsg, 1500);
            });
          });

      },

      inheritanceChain: function (data) {
        var path, parentModel, parent, usedPathItems;
        path = data.substr(1).toLowerCase().split('/').reverse();
        parent = path[path.length - 1];
        usedPathItems = [];

        if (path[0] === '') {
          path.shift();
        }

        if (path[0] === window.initialURLHashed && path[path.length - 1] === 'offlinedata') {
          path[0] = window.BMP.BIC.siteVars.answerSpace.toLowerCase();
          path.pop();
        }

        _.each(path, function (element, index) {
          if (!_.find(usedPathItems, function (id) {return id === element; })) {
            parentModel = app.interactions.get(element) || app.interactions.where({dbid: 'i' + element})[0] || null;
            if (parent && parentModel) {
              if (index !== path.length - 1) {
                parentModel.set({parent: parent});
                parent = parentModel.id;
              } else {
                parentModel.set({parent: 'app'});
                parent = 'app';
              }
            } else {
              throw 'Invalid Model Name';
            }
            usedPathItems.push(element);
          }
        }, this);

        return app.interactions.get(path[0]);
      },

      parseArgs: function (argString, model) {
        var args = argString.split('&'),
          tempargs,
          finalargs = {};

        _.each(args, function (element) {
          tempargs = element.split('=');
          if (tempargs[0].substr(0, 4) !== 'args') {
            tempargs[0] = 'args[' + tempargs[0] + ']';
          }
          finalargs[tempargs[0]] = tempargs[1];
        });

        if (finalargs) {
          model.set({args: finalargs});
        } else {
          model.set({args: null});
        }

        return this;
      },

      suspendApplication: function () {
        var url = $.mobile.path.parseLocation();
        // Store current URL
        localStorage.setItem('pauseURL', url.hrefNoHash);
        // Store form data, if applicable
        if (BMP.BIC.currentInteraction.get('type') === 'form') {
          if (app.currentInteraction.get('args')['args[pid]']) {
            app.view.subView.subView.subView.addToQueue('Draft', true);
          } else {
            app.view.subView.subView.subView.addToQueue('Draft', true)
              .then(function (model) {
                localStorage.setItem('pauseURL', url.hrefNoHash + '/?args[pid]=' + model.id);
              });
          }
        }
      },

      resumeApplication: function () {
        $.mobile.changePage(localStorage.getItem('pauseURL'));
        localStorage.removeItem('pauseURL');
      }
    });

    return new Router();
  }
);
