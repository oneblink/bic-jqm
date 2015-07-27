define(function (require) {
  'use strict';

  // foreign modules

  var isIndexedDBReliable = require('is-indexeddb-reliable');
  var Promise = require('bic/promise');;

  // local modules

  var whenBlinkGapReady = require('bic/promise-blinkgap');

  // this module

  return whenBlinkGapReady.then(function () {
    return new Promise(function (resolve) {
      var timeout = false;
      var timer = setTimeout(function () {
        // timer never necessary for actual usage
        // but timer _is_ mysteriously necessary for running the tests in Safari
        if (window.console && window.console.warn) {
          window.console.warn('timeout: IndexedDB tests too slow');
        }
        timeout = true;
        resolve(false);
      }, 1500); // pick a time under 2sec, which is the default test timeout
      isIndexedDBReliable.quick(function (result) {
        if (!timeout) {
          clearTimeout(timer);
          resolve(result);
        }
      });
    });
  });
});
