define(
  ['backbone', 'models/v3/application', 'models/v3/interaction', 'views/v3/interaction', 'jquery', 'jquerymobile'],
  function (Backbone, app, InteractionModel, InteractionView, $) {
    "use strict";
    var Router = Backbone.Router.extend({
      initialize: function () {
        $(document).on('pagebeforeload', function (e, data) {
          e.preventDefault();
          $.mobile.loading('show');

          var path = data.dataUrl.substr(1).split('/'),
            answerspace,
            interaction,
            args,
            end,
            finalparam,
            parent = "app",
            index,
            tempmodel,
            model,
            promises = [],
            assembleArgs = function (argstring) {
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
            };

          if (path.length === 1) {
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
            answerspace = path.shift();
            end = path.pop();
            if (end && end.indexOf('?') !== -1 && end.indexOf('?') !== 0) {
              finalparam = end.split('?');
              args = assembleArgs(finalparam.pop());
              interaction = finalparam.pop();
            } else if (end && end.indexOf('?') !== -1 && end.indexOf('?') === 0) {
              interaction = path.pop();
              args = assembleArgs(end.slice(1));
            } else {
              args = null;
              interaction = end;
            }
          }

          if (path.length > 0) {
            for (index = 0; index < path.length; index = index + 1) {
              tempmodel = new InteractionModel({
                name: path[index],
                parent: parent,
                siteName: app.get("siteName"),
                BICtype: "Interaction"
              });
              app.interactions.add(tempmodel);
              promises.push(tempmodel.fetch());
              parent = tempmodel.cid;
            }
          }

          $.when.apply($, promises).then(function () {
            model = new InteractionModel({
              name: interaction,
              parent: parent,
              siteName: app.get("siteName"),
              BICtype: "Interaction",
              args: args
            });
            app.interactions.add(model);
            model.fetch({
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
            });
          }, function () {
            data.deferred.reject(data.absUrl, data.options);
            $.mobile.showPageLoadingMsg($.mobile.pageLoadErrorMessageTheme, $.mobile.pageLoadErrorMessage, true);
            setTimeout($.mobile.hidePageLoadingMsg, 1500);
          });
        });
      }
    });

    return new Router();
  }
);

