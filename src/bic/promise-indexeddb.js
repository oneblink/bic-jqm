define(function (require) {
  'use strict';

  // foreign modules

  var isIndexedDBReliable = require('is-indexeddb-reliable');

  // local modules

  var c = require('bic/console');
  var deadline = require('@jokeyrhyme/deadline');
  var whenBlinkGapReady = require('bic/promise-blinkgap');

  // this module

  function isIt () {
    return new Promise(function (resolve) {
      isIndexedDBReliable.quick(function (result) {
        resolve(result);
      });
    });
  }

  return whenBlinkGapReady.then(function () {
    // pick a time under 2sec, which is the default test timeout
    return deadline.promise(isIt(), 1500).then(null, function () {
      c.warn('timeout: IndexedDB tests too slow');
      return Promise.resolve();
    });
    // timer should not be necessary for actual usage
    // but timer _is_ mysteriously necessary for running the tests in Safari
  });
});
