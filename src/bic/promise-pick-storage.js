define(function (require) {
  'use strict';

  // foreign modules

  var Pouch = require('pouchdb');

  // local modules

  var c = require('bic/console');
  var whenIndexedDBReliable = require('bic/promise-indexeddb');

  // this module

  return whenIndexedDBReliable.then(function (idb) {
    if (window.BMP.BIC.isBlinkGap === true) {
      if (Pouch.adapters.websql) {
        c.info('persistent storage: websql');
        return Promise.resolve('websql');
      }
    }
    if (idb && Pouch.adapters.idb) {
      c.info('persistent storage: idb');
      return Promise.resolve('idb');
    }
    c.warn('no reliable persistent storage detected');
    return Promise.resolve(null);
  });
});
