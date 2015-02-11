define(['facade'], function (facade) {
  'use strict';

  var auth = window.BMP.Authentication;

  facade.subscribe('offlineAuthentication', 'parseAuthString', function (authString) {
    var credentials = {};

    authString = authString.split('&')
    for (var i = 0; i < authString.length; i++) {
      var split = authString[i].split('=');
      switch (split[0]) {
        case 'username':
          credentials.principal = split[1];
          break;
        case 'password':
          credentials.credential = split[1];
          break;
        case 'submit':
          break;
        default:
          credentials[split[0]] = split[1];
      }
      if (!credentials.expiry) {
        // 3 day default expiry
        credentials.expiry = 86400000 * 3;
      }
    }

    facade.publish('authParsed', credentials);
  });

  facade.subscribe('offlineAuthentication', 'authParsed', function (auth) {
    facade.publish('storeAuth', auth);
  });

  facade.subscribe('offlineAuthentication', 'storeAuth', function (authentication) {
    //console.log('offlineAuthentication', 'storeOfflineAuthentication', data);
    auth.setCurrent(authentication, function () {
      facade.publish('storeAuthSuccess');
    }, function () {
      facade.publish('storeAuthFailure');
    });
  });

  facade.subscribe('offlineAuthentication', 'storeAuthSuccess', function () {
    console.log('Stored successfully!');
  })

  facade.subscribe('offlineAuthentication', 'storeAuthFailure', function () {
    console.log('Stored failure!');
  })
});
