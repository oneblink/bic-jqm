define(function (require) {
  'use strict';
  var isIndexedDBReliable = require('is-indexeddb-reliable');
  var whenBlinkGapReady = require('promise-blinkgap');

  return whenBlinkGapReady.then(function () {
    return new Promise(function (resolve) {
      var timer = setTimeout(function () {
        // timer never necessary for actual usage
        // but timer _is_ mysteriously necessary for running the tests in Safari
        if (window.console && window.console.warn) {
          window.console.warn('timeout: IndexedDB tests too slow');
        }
        resolve(false);
      }, 500);
      isIndexedDBReliable.quick(function (result) {
        clearTimeout(timer);
        resolve(result);
      });
    });
  });
});
