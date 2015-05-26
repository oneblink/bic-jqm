define(function () {
  'use strict';
  return {
    'data': [
      {
        isAvailable: function () {
          try {
            return Modernizr.indexeddb && window.indexedDB.open('idbTest', 1).onupgradeneeded === null && navigator.userAgent.indexOf('iPhone') === -1 && navigator.userAgent.indexOf('iPad') === -1 || window.BMP.BIC.isBlinkGap && Modernizr.websqldatabase;
          } catch (ignore) {
            return false;
          }
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
    ]
  };
});
