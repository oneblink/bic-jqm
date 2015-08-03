define(function (require) {
  'use strict';

  // foreign modules

  var $ = require('jquery');
  var _ = require('underscore');
  var Backbone = require('backbone');
  var Modernizr = require('modernizr');
  var Promise = require('bic/promise');

  // local modules

  var app = require('bic/model/application');
  var c = require('bic/console');
  var InteractionView = require('bic/view/interaction');
  var uiTools = require('bic/lib/ui-tools');
  var whenDOMReady = require('bic/promise-dom-ready');

  // this module

  var Router;
  var $document = $(document);

  require('jquerymobile');

  Router = Backbone.Router.extend({
    initialize: function () {
      var location = window.location;
      c.log('bic/router: initialize()...');
      window.BMP.FileInput.initialize();

      app.router = this;

      this.isOfflineFirst = (function () {
        var isLocalProtocol = location.protocol === 'file:' || location.protocol === 'ms-appx:';
        return isLocalProtocol &&
          /\/www\/index\.html$/.test(location.pathname);
      }());

      this.offlineDirectory = (function (me) {
        return me.isOfflineFirst ? location.href.replace(/\/www\/index\.html$/, '/www/') : '';
      }(this));

      if (Modernizr.localstorage) {
        if (window.BMP.isBlinkGap) {
          $document.on('pause', this.suspendApplication);
          $document.on('resume', this.resumeApplication);
        }

        if (document.hidden !== undefined) {
          $document.on('visibilitychange', function () {
            if (document.hidden) {
              app.router.suspendApplication();
            } else {
              app.router.resumeApplication();
            }
          });
        }
      }

      $document.on('pagebeforeload', function (e, data) {
        // http://api.jquerymobile.com/1.3/pagebeforeload/
        // data.deferred.resolve|reject is expected after data.preventDefault()
        e.preventDefault();

        // keep track of history depth for forms post-submission behaviour
        app.history.length += 1;

        uiTools.showLoadingAnimation();
        app.router.routeRequest(data);
      });

      app.collections()
        .then(function () {
          return app.setup();
        })
        .then(null, function () {
          return;
        })
        .then(function () {
          // Need to hang around until native offline is ready
          return new Promise(function (resolve, reject) {
            var bg = window.BMP.BlinkGap;
            if (bg.isHere() && bg.hasOffline()) {
              bg.waitForOffline(
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
        .then(null, function (err) {
          c.error(err);
          return;
        })
        .then(whenDOMReady)
        .then(function () {
          return app.initialRender();
        })
        .then(null, function (err) {
          c.error(err);
          throw err;
        });
    },

    /**
      @method routeRequest
      @decription Loads a model based on the url. Will redirect to the
      answerSpace if no model can be found

    */
    routeRequest: function (data) {
      var path = $.mobile.path.parseUrl(data.absUrl);
      var model;

      c.debug('router.routeRequest()... ' + data.absUrl);

      if (BMP.BlinkGap.isOfflineReady() && path.hrefNoSearch.indexOf(window.cordova.offline.filePathPrex) !== -1) {
        // Remove file path
        path.pathname = path.hrefNoSearch.substr(path.hrefNoSearch.indexOf(window.cordova.offline.filePathPrex) + window.cordova.offline.filePathPrex.length + 1);
        // Remove domain info
        path.pathname = path.pathname.substr(path.pathname.indexOf('/'));
        // Remove file suffix
        path.pathname = path.pathname.substr(0, path.pathname.indexOf('.'));
      }

      app.whenPopulated()
        .then(function () {
          model = app.router.inheritanceChain(path);
          model.setArgsFromQueryString(path.search);
          app.currentInteraction = model;

          model.prepareForView(data).then(function (innerModel) {
            new InteractionView({
              tagName: 'div',
              model: innerModel
            }).once('render', function () {
              this.$el.attr('data-url', data.dataUrl); // .replace(/['"]/g, convertIllegalUrlChars));
              this.$el.attr('data-external-page', true);
              this.$el.one('pagecreate', $.mobile._bindPageRemove);

              // http://api.jquerymobile.com/1.3/pagebeforeload/
              // data.deferred.resolve|reject is expected after data.preventDefault()
              data.deferred.resolve(data.absUrl, data.options, this.$el);
            }).render(data);
          });
        })
        // catch the error thrown when a model cant be found
        .then(undefined, function (err) {
          c.error('router.routeRequest(): error...');
          c.error(err);

          // http://api.jquerymobile.com/1.3/pagebeforeload/
          // data.deferred.resolve|reject is expected after data.preventDefault()
          data.deferred.reject(data.absUrl, data.options);

          $.mobile.showPageLoadingMsg($.mobile.pageLoadErrorMessageTheme, $.mobile.pageLoadErrorMessage, true);

          setTimeout(function () {
            $.mobile.hidePageLoadingMsg();
            if (app.view) {
              return app.view.home();
            }
            // if we've gotten here it means that the user has typed in an invalid url
            // and we've not fully initialized, so go to the root answerSpace.
            window.location.pathname = window.location.pathname.split('/')[1];
          }, 2500);
        });
    },

    inheritanceChain: function (data) {
      var path, parentModel, parent, usedPathItems;

      path = (data.pathname || data.path || '').substr(1).toLowerCase().split('/').reverse();

      parent = path[path.length - 1];
      usedPathItems = [];

      // account for file:/// with triple slash, or leading slashes
      if (path[0] === '') {
        path.shift();
      }

      if (this.isOfflineFirst) {
        if (path[0] === 'index.html' && path[1] === 'www') {
          path = [ app.siteVars.answerSpace.toLowerCase() ];
        }
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
            throw new Error('Invalid Model Name:' + parent);
          }
          usedPathItems.push(element);
        }
      }, this);

      return app.interactions.get(path[0]);
    },

/**
Deprecated. Delegates to {@link Interaction.setArgsFromQueryString model.setArgsFromQueryString()}

@deprecated
*/
    parseArgs: function (argString, model) {
      c.warn('BMP.BIC.router.parseArgs() is deprecated and will be removed.');
      model.setArgsFromQueryString(argString);
      return this;
    },

    /**
      @method suspendApplication
      @description Triggered when the device suspends the application
      or when the browser tab loses focus.

      Saves any 'add' or 'edit' interactions to the pending queue

      @fires global#app:pause
    */
    suspendApplication: function () {
      var url = $.mobile.path.parseLocation();
      var type;
      var action;

      c.info('router.suspendApplication()...');

      if (!app.currentInteraction || !app.currentInteraction.get) {
        return;
      }
      // Store current URL
      localStorage.setItem('pauseURL', url.hrefNoHash);

      /**
        Application pause event. Any unsaved form interactions
        will be automatically saved to the pending queue by blink, but if you need more
        use this event if you need to do some housekeeping before the application
        is paused by the device or if the user switches tabs on a browser.

        @event global#app:pause
      */
      Backbone.trigger('app:pause');

      type = app.currentInteraction.get('type') + '';
      // dont save if the current interaction isnt savable.
      if (type.toLowerCase() !== 'form') {
        return;
      }

      action = (app.currentInteraction.get('blinkFormAction') + '').toLowerCase();

      if (action !== 'add' && action !== 'edit') {
        return;
      }

      // Store form data, if applicable
      if (app.currentInteraction.getArgument('pid')) {
        // saving over existing draft
        app.view.subView.subView.subView.addToQueue('Draft', true);
      } else {
        // saving a new draft
        app.view.subView.subView.subView.addToQueue('Draft', true)
          .then(function (model) {
            var search = url.search;
            search += search.substring(0, 1) !== '?' ? '?' : '&';
            search += 'args[pid]=' + model.id;
            localStorage.setItem('pauseURL', url.hrefNoSearch + search);
          });
      }
    },

    /**
      @method resumeApplication
      @description Triggered when the device resumes the application
      or when the browser tab gets focus.

      @fires global#app:resume
    */
    resumeApplication: function () {
      var pauseURL = localStorage.getItem('pauseURL');

      c.info('router.resumeApplication()...');

      if (!pauseURL) {
        return;
      }

      if ($.mobile.path.parseLocation().href !== pauseURL) {
        $.mobile.changePage(pauseURL, {showLoadMsg: false, transition: 'none', reloadPage: false});
      }
      localStorage.removeItem('pauseURL');

      /**
        Application resume event. Listen for this event if you need to restart any
        thing that was paused on when the user put the app in the background

        @event global#app:resume
      */
      Backbone.trigger('app:resume');
    },

    getRootRelativePath: function (path) {
      var parsed;
      if (!this.isOfflineFirst) {
        return path;
      }
      parsed = $.mobile.path.parseUrl(this.offlineDirectory);
      return path.replace(parsed.pathname, '/');
    }
  });

  return new Router();
});
