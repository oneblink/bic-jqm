define(function () {
  "use strict";
  return {
    'data': [
      {
        isAvailable: function () {
          try {
            return (Modernizr.indexeddb && window.indexedDB.open('idbTest', 1).onupgradeneeded === null) || window.BMP.BIC.isBlinkGap;
          } catch (ignore) {}
          return false;
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
