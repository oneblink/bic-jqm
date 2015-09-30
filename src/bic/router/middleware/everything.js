define(function (require) {
  'use strict';

  // foreign modules

  var $ = require('jquery');
  var NotFoundError = require('typed-errors').NotFoundError;

  // local modules

  var app = require('bic/model/application');
  var c = require('bic/console');
  var InteractionView = require('bic/view/interaction');
  var FormInteractionView = require('bic/view/interaction/form');
  var uiTools = require('bic/lib/ui-tools');

  // this module

  function handleFormRecordNotExisting () {
    $('body').one('click', function () {
      uiTools.hideLoadingAnimation();

      if (app.history.length > 1) {
        return;
      }
      $.mobile.changePage('/' + app.get('siteName'));
    });

    uiTools.showLoadingAnimation({
      text: app.get('recordNotFoundMessage'),
      textVisible: true,
      textonly: true,
      theme: 'a'
    });
  }

  return function (data, next) {
    var path = $.mobile.path.parseUrl(data.absUrl);

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
        var model = app.router.inheritanceChain(path);
        model.setArgsFromQueryString(path.search);
        app.currentInteraction = model;

        return model.prepareForView(data);
      })
      .then(function (model) {
        var View = model.get('type') === 'form' ? FormInteractionView : InteractionView;
        return new View({
          tagName: 'div',
          model: model
        });
      })
      .then(function (view) {
        view.once('render', function () {
          view.$el.attr('data-url', data.dataUrl);
          view.$el.attr('data-external-page', true);
          view.$el.one('pagecreate', $.mobile._bindPageRemove);

          // http://api.jquerymobile.com/1.3/pagebeforeload/
          // data.deferred.resolve|reject is expected after data.preventDefault()
          data.deferred.resolve(data.absUrl, data.options, view.$el);
        });
        view.render(data);
      })
      .catch(function (err) {
        c.error('router.routeRequest(): error...');
        c.error(err);

        // http://api.jquerymobile.com/1.3/pagebeforeload/
        // data.deferred.resolve|reject is expected after data.preventDefault()
        data.deferred.reject(data.absUrl, data.options);

        if (err instanceof NotFoundError) {
          return handleFormRecordNotExisting(data);
        }

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
  };
});
