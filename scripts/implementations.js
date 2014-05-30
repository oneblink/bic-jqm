define(function () {
  "use strict";
  return {
    'data': [
      {
        isAvailable: function () {
          return (Modernizr.indexeddb && indexedDB.open('idbTest', 1).onupgradeneeded === null) || window.BMP.isBlinkGap;
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
