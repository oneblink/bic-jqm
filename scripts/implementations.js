define(function () {
  "use strict";
  return {
    'data': [
      {
        isAvailable: function () {
          return (Modernizr.indexeddb && window.indexedDB.open('idbTest', 1).onupgradeneeded === null) || window.BMP.isBlinkGap;
        },

        implementation: 'data-pouch'
      },

      {
        isAvailable: function () {
          return true;
        },

        implementation: 'data-inMemory'
      }
    ],
    'api': [
      {
        isAvailable: function () {
          return window.cordova && window.cordova.offline;
        },
        implementation: 'api-native'
      },
      {
        isAvailable: function () {
          return true;
        },
        implementation: 'api-web'
      }
    ]
  };
});
