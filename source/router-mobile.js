define(
  ['backbone', 'model-application-mobile', 'model-interaction-mobile', 'view-interaction-mobile', 'jquery', 'jquerymobile'],
  function (Backbone, app, InteractionModel, InteractionView, $) {
    "use strict";
    var Router = Backbone.Router.extend({
      initialize: function () {
        app.router = this;
        $(document).on('pagebeforeload', function (e, data) {
          e.preventDefault();
          $.mobile.loading('show');

          app.router.processPath(data);
        });
      },

      processPath: function (data) {
        var path = data.dataUrl.substr(1).split('/'),
          answerspace,
          interaction,
          args,
          end,
          finalparam,
          parent = "app",
          index,
          promises = [];

        if (path[path.length - 1] === "") {
          path.pop();
        }

        if (path.length === 1) {
          // Home page of app
          if (app.has("homeScreen") && app.get("homeScreen") === true) {
            answerspace = app.get("siteName");
            interaction = app.get("homeInteraction");
            args = "";
          } else {
            answerspace = app.get("siteName");
            interaction = app.get("siteName");
            args = "";
          }
          path = [];
        } else {
          // Need to parse interaction + dependancies
          answerspace = path.shift();
          end = path.pop();
          if (end && end.indexOf('?') !== -1 && end.indexOf('?') !== 0) {
            finalparam = end.split('?');
            args = this.assembleArgs(finalparam.pop());
            interaction = finalparam.pop();
          } else if (end && end.indexOf('?') !== -1 && end.indexOf('?') === 0) {
            interaction = path.pop();
            args = this.assembleArgs(end.slice(1));
          } else {
            args = null;
            interaction = end;
          }
        }

        // Load any dependancies
        if (path.length > 0) {
          for (index = 0; index < path.length; index = index + 1) {
            promises.push(app.router.loadInteraction(path[index], null, parent));
            parent = path[index];
          }
        }

        // Load final interaction
        $.when.apply($, promises).then(function () {
          app.router.loadInteraction(interaction, args, parent, app.router.displayInteraction(data));
        });
      },

      assembleArgs: function (argstring) {
        var argarray = argstring.split('&'),
          args = {};
        $.each(argarray, function (index, string) {
          var equalIndex, name, value;
          if (string.length !== 0 && (equalIndex = string.indexOf('=')) !== -1) {
            name = string.substring(0, equalIndex);
            value = string.substring(equalIndex + 1);
            if (value) {
              args[decodeURIComponent(name)] = decodeURIComponent(value);
            }
          }
        });
        return args;
      },

      loadInteraction: function (interaction, args, parent, options) {
        var dfrd, promise;
        // Find if in collection
        if (app.interactions.get(interaction)) {
          if (app.interactions.get(interaction).get("type") === "madl code" && options) {
            promise = app.interactions.get(interaction).fetch(options);
          } else {
            dfrd = $.Deferred();
            promise = dfrd.promise();
            if (options) {
              options.success(app.interactions.get(interaction), 'Collection', options);
            }
            dfrd.resolve();
          }
          app.interactions.get(interaction).set("parent", parent);
        } else {
          app.interactions.add({
            _id: interaction,
            name: interaction,
            parent: parent,
            siteName: app.get("siteName"),
            BICtype: "Interaction",
            args: args
          });
          promise = app.interactions.get(interaction).fetch(options);
        }
          // Fetch if MADL
        // Fetch and add to collection
        return promise;
      },

      displayInteraction: function (data) {
        return {
          success: function (model, response, options) {
            //model.inherit();
            var view = new InteractionView({
              tagName: 'div',
              model: model
            }).render();
            view.$el.attr("data-url", options.data.dataUrl);
            view.$el.attr("data-external-page", true);
            view.$el.one('pagecreate', $.mobile._bindPageRemove);
            options.data.deferred.resolve(options.data.absUrl, options.data.options, view.$el);
          },
          error: function (model, xhr, options) {
            options.data.deferred.reject(options.data.absUrl, options.data.options);
            $.mobile.showPageLoadingMsg($.mobile.pageLoadErrorMessageTheme, $.mobile.pageLoadErrorMessage, true);
            setTimeout($.mobile.hidePageLoadingMsg, 1500);
          },
          data: data,
          app: app
        };
      }
    });

    return new Router();
  }
);

