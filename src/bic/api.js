define(function (require) {
  'use strict';

  if (window.cordova && window.cordova.offline) {
    return require('bic/api-native');
  }

  return require('bic/api-web');
});
