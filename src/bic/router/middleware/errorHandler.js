define(function (require) {
  'use strict';

  // foreign modules

  var $ = require('jquery');
  var NotFoundError = require('typed-errors').NotFoundError;

  // local modules

  var c = require('bic/console');
  var uiTools = require('bic/lib/ui-tools');

  // this module

  function handleFormRecordNotExisting (jqmData, bicData) {
    var app = bicData.app;
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

  return function (err, jqmData, bicData) {
    var app = bicData.app;

    c.error('router.routeRequest(): error...');
    c.error(err);

    // http://api.jquerymobile.com/1.3/pagebeforeload/
    // data.deferred.resolve|reject is expected after data.preventDefault()
    jqmData.deferred.reject(jqmData.url, jqmData.options);

    if (err instanceof NotFoundError) {
      return handleFormRecordNotExisting(jqmData, bicData);
    }

    $.mobile.showPageLoadingMsg($.mobile.pageLoadErrorMessageTheme, $.mobile.pageLoadErrorMessage, true);

    setTimeout(function () {
      $.mobile.hidePageLoadingMsg();
      if (app.view) {
        return app.view.home();
      }
      // if we've gotten here it means that the user has typed in an invalid url
      // and we've not fully initialized, so go to the root answerSpace.
      if (app.get('siteName')) {
        $.mobile.changePage('/' + app.get('siteName'));
      } else {
        window.location.pathname = window.location.pathname.split('/')[1];
      }
    }, 2500);
  };
});
