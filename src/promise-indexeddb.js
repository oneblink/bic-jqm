define(function (require) {
  'use strict';
  var isIndexedDBReliable = require('is-indexeddb-reliable');
  var whenBlinkGapReady = require('promise-blinkgap');

  return whenBlinkGapReady.then(function () {
    return new Promise(function (resolve) {
      isIndexedDBReliable.quick(resolve);
    });
  });
});
