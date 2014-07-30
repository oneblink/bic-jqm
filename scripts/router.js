define(
  ['model-application', 'view-interaction'],
  function (app, InteractionView) {
    "use strict";
    var Router = Backbone.Router.extend({
      initialize: function () {
        var collectionCallback, setupCallback, formsCallback;

        BMP.FileInput.initialize();

        app.router = this;

        $(document).on('pagebeforeload', function (e, data) {
          e.preventDefault();
          $.mobile.loading('show');
          if (app.currentInteraction && app.currentInteraction.get('dbid') === "i" + app.get('loginPromptInteraction')) {
            app.checkLoginStatus().then(function () {
              app.router.routeRequest(data);
            });
          } else {
            app.router.routeRequest(data);
          }
        });

        formsCallback = function () {
          app.forms.download();
          app.initialRender();
        };

        setupCallback = function () {
          if (navigator.onLine) {
            app.populate().then(formsCallback, formsCallback);
          } else {
            app.initialRender();
          }
        };

        collectionCallback = function () {
          app.setup().then(setupCallback, setupCallback);
        };

        app.datastore().collections().then(collectionCallback, collectionCallback);
      },

      routeRequest: function (data) {
        var path = $.mobile.path.parseUrl(data.dataUrl),
          model;

        if (window.cordova && window.cordova.offline && window.cordova.offline.available && path.hrefNoSearch.indexOf(window.cordova.offline.filePathPrex) !== -1) {
          // Remove file path
          path.hrefNoSearch = path.hrefNoSearch.substr(path.hrefNoSearch.indexOf(window.cordova.offline.filePathPrex) + window.cordova.offline.filePathPrex.length + 1);
          // Remove domain info
          path.hrefNoSearch = path.hrefNoSearch.substr(path.hrefNoSearch.indexOf('/'));
          // Remove file suffix
          path.hrefNoSearch = path.hrefNoSearch.substr(0, path.hrefNoSearch.indexOf('.'));
        }

        model = this.inheritanceChain(path.hrefNoSearch);

        app.currentInteraction = model;

        this.parseArgs(path.search.substr(1), model);

        model.prepareForView(data).then(function (model) {
          new InteractionView({
            tagName: 'div',
            model: model
          }).once("render", function () {
            this.$el.attr("data-url", data.dataUrl);
            this.$el.attr("data-external-page", true);
            this.$el.one('pagecreate', $.mobile._bindPageRemove);
            data.deferred.resolve(data.absUrl, data.options, this.$el);
          }).render(data);
        }, function () {
          data.deferred.reject(data.absUrl, data.options);
          $.mobile.showPageLoadingMsg($.mobile.pageLoadErrorMessageTheme, $.mobile.pageLoadErrorMessage, true);
          setTimeout($.mobile.hidePageLoadingMsg, 1500);
        });
      },

      inheritanceChain: function (data) {
        var path, parentModel, parent, usedPathItems;
        path = data.substr(1).toLowerCase().split('/').reverse();
        parent = path[path.length - 1];
        usedPathItems = [];

        if (path[0] === "") {
          path.shift();
        }

        _.each(path, function (element, index) {
          if (!_.find(usedPathItems, function (id) {return id === element; })) {
            parentModel = app.interactions.get(element) || app.interactions.where({dbid: "i" + element})[0] || null;
            if (parent && parentModel) {
              if (index !== path.length - 1) {
                parentModel.set({parent: parent});
                parent = parentModel.id;
              } else {
                parentModel.set({parent: "app"});
                parent = "app";
              }
            } else {
              throw "Invalid Model Name";
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
          if (tempargs[0].substr(0, 4) !== "args") {
            tempargs[0] = "args[" + tempargs[0] + "]";
          }
          finalargs[tempargs[0]] = tempargs[1];
        });

        if (finalargs) {
          model.set({args: finalargs});
        } else {
          model.set({args: null});
        }

        return this;
      }
    });

    return new Router();
  }
);

