define(function (require) {
  'use strict';

  if (window.cordova && window.cordova.offline) {
    return require('api-native');
  }

  return require('api-web');
});
