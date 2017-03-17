define(function (require) {
  'use strict';

  // foreign modules

  var isIndexedDBReliable = require('@blinkmobile/is-indexeddb-reliable');
  var Promise = require('bic/promise');

  // local modules

  var c = require('bic/console');
  var deadline = require('@jokeyrhyme/deadline');
  var whenBlinkGapReady = require('bic/promise-blinkgap');

  // this module

  var TIMEOUT = 30 * 1000; // 30 seconds

  function isIt () {
    return new Promise(function (resolve) {
      isIndexedDBReliable.quick(function (result) {
        resolve(result);
      });
    });
  }

  return whenBlinkGapReady.then(function () {
    return deadline.promise(isIt(), TIMEOUT).then(null, function () {
      c.warn('timeout: IndexedDB tests too slow');
      return Promise.resolve();
    });
  });
});
