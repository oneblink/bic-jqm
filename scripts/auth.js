define(['facade'], function (facade) {
  'use strict';

  var auth = window.BMP.Authentication;

  facade.subscribe('offlineAuthentication', 'storeAuth', function (authentication) {
    //console.log('offlineAuthentication', 'storeOfflineAuthentication', data);
    auth.setCurrent(authentication, function () {
      facade.publish('storeAuthSuccess');
    }, function () {
      facade.publish('storeAuthFailure');
    });
  });

  facade.subscribe('offlineAuthentication', 'authenticateAuth', function (authentication) {
    auth.authenticate(authentication, function () {
      facade.publish('loggedIn');
    }, function () {
      facade.publish('loggedOut');
    });
  });
});
