define(function (require) {
  'use strict';

  if (Modernizr.indexeddb && window.indexedDB.open('idbTest', 1).onupgradeneeded === null && navigator.userAgent.indexOf('iPhone') === -1 && navigator.userAgent.indexOf('iPad') === -1) {
    return require('data-pouch');
  }

  if (window.BMP.BIC.isBlinkGap && Modernizr.websqldatabase) {
    return require('data-pouch');
  }

  return require('data-inMemory');
});
