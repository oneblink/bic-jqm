define(function (require) {
  'use strict';
  var whenIndexedDBReliable = require('promise-indexeddb');

  return whenIndexedDBReliable.then(function (idb) {
    if (window.BMP.BIC.isBlinkGap === true) {
      if (Pouch.adapters.websql) {
        return Promise.resolve('websql');
      }
    }
    if (idb && Pouch.adapters.idb) {
      return Promise.resolve('idb');
    }
    return Promise.reject(new Error('no reliable persistent storage detected'));
  });
});
