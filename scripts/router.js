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
          var path = $.mobile.path.parseUrl(data.dataUrl);

          app.router.inheritanceChain(path.hrefNoSearch).parseArgs(path.search.substr(1)).prepareView(data).then(function (model) {
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
        });
      },

      inheritanceChain: function (data) {
        var path, parent, usedPathItems;
        path = data.substr(1).split('/');
        parent = "app";
        usedPathItems = [];

        if (path[path.length - 1] === "") {
          path.pop();
        }

        _.each(path, function (element) {
          if (!_.find(usedPathItems, function (id) {return id === element; })) {
            parent = app.interactions.get(element).set({parent: parent}).id;
            usedPathItems.push(element);
          }
        }, this);

        return app.interactions.get(parent);
      }
    });

    return new Router();
  }
);

