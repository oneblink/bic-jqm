define(
  ['model-application', 'view-interaction'],
  function (app, InteractionView) {
    "use strict";
    var Router = Backbone.Router.extend({
      initialize: function () {
        app.router = this;
        $(document).on('pagebeforeload', function (e, data) {
          e.preventDefault();
          $.mobile.loading('show');
          app.router.routeRequest(data);
        });
      },

      routeRequest: function (data) {
        var path = $.mobile.path.parseUrl(data.dataUrl),
          model;

        model = this.inheritanceChain(path.hrefNoSearch);

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
        path = data.substr(1).split('/');
        parent = "app";
        usedPathItems = [];

        if (path[path.length - 1] === "") {
          path.pop();
        }

        _.each(path, function (element) {
          if (!_.find(usedPathItems, function (id) {return id === element; })) {
            parentModel = app.interactions.get(element) || app.interactions.where({dbid: "i" + element})[0] || null;
            if (parent) {
              parentModel.set({parent: parent});
              parent = parentModel.id;
            } else {
              throw "Invalid Model Name";
            }
            usedPathItems.push(element);
          }
        }, this);

        return app.interactions.get(parent);
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

