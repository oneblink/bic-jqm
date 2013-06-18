define(function () {
  "use strict";
  return {
    'data': [
      {
        isAvailable: function () {
          return Modernizr.indexeddb || window.BMP.isBlinkGap;
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