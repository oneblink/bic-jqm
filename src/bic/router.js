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
  var Middleware = require('bic/router/middleware');
  var uiTools = require('bic/lib/ui-tools');
  var whenDOMReady = require('bic/promise-dom-ready');
  var parseUrlPath = require('bic/lib/url-path-parser');

  // this module

  var Router;
  var $document = $(document);

  require('jquerymobile');

  Router = Backbone.Router.extend({
    initialize: function () {
      c.log('bic/router: initialize()...');
      window.BMP.FileInput.initialize();

      app.router = this;

      this.middleware = new Middleware();
      this.middleware.use(Middleware.path);
      this.middleware.use(Middleware.app);
      this.middleware.use(Middleware.whenPopulated);
      this.middleware.use(Middleware.login);
      this.middleware.use(Middleware.model);
      this.middleware.use(Middleware.view);
      this.middleware.use(Middleware.viewRender);
      this.middleware.use(Middleware.bootStatus);
      this.middleware.use(Middleware.resolve);

      this.middleware.addErrorHandler(Middleware.errorHandler);

      if (Modernizr.localstorage) {
        if (window.BMP.isBlinkGap) {
          $document.on('pause', this.suspendApplication);
        }

        if (document.hidden !== undefined) {
          $document.on('visibilitychange', function () {
            if (document.hidden) {
              app.router.suspendApplication();
            }
          });
        }
      }

      $document.on('pagebeforeload', function (e, data) {
        // http://api.jquerymobile.com/1.3/pagebeforeload/
        // data.deferred.resolve|reject is expected after data.preventDefault()
        e.preventDefault();
        Backbone.trigger('route:beforechange');
        // keep track of history depth for forms post-submission behaviour
        app.history.length += 1;

        uiTools.showLoadingAnimation();
        app.router.routeRequest(data);
      });

      app.collections()
        .then(function () {
          return app.setup();
        })
        .then(function () {
          var bg = window.BMP.BlinkGap;
          // Need to hang around until Cordova is ready
          return bg.isHere() ? bg.whenReady() : Promise.resolve();
        })
        .then(function () {
          return app.populate();
        })
        .then(whenDOMReady)
        .then(function () {
          return app.initialRender();
        })
        .catch(function (err) {
          c.error(err);
          throw err;
        });
    },

    /**
      @method routeRequest
      @decription Loads a model based on the url. Will redirect to the
      answerSpace if no model can be found

    */
    routeRequest: function (jqmData) {
      var bicData = {};
      /**
      call `stopRoute()` from within a middleware if `next()` will not be called
      do not call both, and definitely call one of them
      */
      bicData.stopRoute = function () {
        // http://api.jquerymobile.com/1.3/pagebeforeload/
        jqmData.deferred.reject(jqmData.absUrl, jqmData.options);
      };
      this.middleware.init(jqmData, bicData);
    },

    inheritanceChain: function (data) {
      var path, parentModel, parent, usedPathItems;

      path = parseUrlPath(data.pathname || data.path || '');

      parent = path.length ? path[path.length - 1] : app.siteVars.answerSpace.toLowerCase();
      usedPathItems = [];

      if (!path.length) {
        path = [ app.get('siteName') ];
      }

      _.each(path, function (element, index) {
        if (!_.find(usedPathItems, function (id) { return id === element; })) {
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
      window.localStorage.setItem('pauseURL', url.hrefNoHash);

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
            window.localStorage.setItem('pauseURL', url.hrefNoSearch + search);
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
      var pauseURL = window.localStorage.getItem('pauseURL');

      c.info('router.resumeApplication()...');

      if (!pauseURL) {
        return;
      }

      if ($.mobile.path.parseLocation().href !== pauseURL) {
        $.mobile.changePage(pauseURL, {showLoadMsg: false, transition: 'none', reloadPage: false});
      }
      window.localStorage.removeItem('pauseURL');

      /**
        Application resume event. Listen for this event if you need to restart any
        thing that was paused on when the user put the app in the background

        @event global#app:resume
      */
      Backbone.trigger('app:resume');
    }
  });

  Router.Middleware = Middleware;

  app.Router = Router;

  return new Router();
});
