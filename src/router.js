define(
  ['model-application', 'view-interaction', 'lib/ui-tools'],
  function (app, InteractionView, uiTools) {
    'use strict';
    var Router
      , $document = $(document);

    Router = Backbone.Router.extend({
      initialize: function () {
        BMP.FileInput.initialize();

        app.router = this;

        this.isOfflineFirst = (function () {
          var isLocalProtocol = location.protocol === 'file:' || location.protocol === 'ms-appx:';
          return isLocalProtocol &&
            /\/www\/index\.html$/.test(location.pathname);
        }());

        this.offlineDirectory = (function (me) {
          return me.isOfflineFirst ? location.href.replace(/\/www\/index\.html$/, '/www/') : '';
        }(this));

        if ( Modernizr.localstorage){
          if (BMP.isBlinkGap) {
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
              if (BMP.BlinkGap.isHere() && BMP.BlinkGap.hasOffline()) {
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
            return app.initialRender();
          })
          .then(null, function (err) {
            throw err;
          });
      },

      /*
        @method routeRequest
        @decription Loads a model based on the url. Will redirect to the
        answerSpace if no model can be found

      */
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
          .then(function () {
            model = app.router.inheritanceChain(path);
            model.setArgsFromQueryString(path.search);
            app.currentInteraction = model;

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
            });
          })
          //catch the error thrown when a model cant be found
          .then(undefined, function(){
            data.deferred.reject(data.absUrl, data.options);
            $.mobile.showPageLoadingMsg($.mobile.pageLoadErrorMessageTheme, $.mobile.pageLoadErrorMessage, true);

            setTimeout(function(){
              $.mobile.hidePageLoadingMsg();
              if ( app.view ){
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
        /*eslint-disable no-console, no-unused-expressions*/
        console && console.warn('BMP.BIC.router.parseArgs() is deprecated and will be removed.');
        /*eslint-enable no-console, no-unused-expressions*/
        model.setArgsFromQueryString( argString );
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
        var url = $.mobile.path.parseLocation()
          , type
          , action;

        if ( !app.currentInteraction ){
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
        //dont save if the current interaction isnt savable.
        if ( type.toLowerCase() !== 'form'){
          return;
        }

        action = (app.currentInteraction.get('blinkFormAction') + '').toLowerCase();

        if (action !== 'add' && action !== 'edit'){
          return;
        }

        // Store form data, if applicable
        if (app.currentInteraction.getArgument('pid')){
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
  }
);
