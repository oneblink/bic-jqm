define(function (require) {
  'use strict';

  // foreign modules

  var Pouch = require('pouchdb');
  var Promise = require('bic/promise');

  // local modules

  var whenIndexedDBReliable = require('bic/promise-indexeddb');

  // this module

  var msg = 'no reliable persistent storage detected';

  return whenIndexedDBReliable.then(function (idb) {
    if (window.BMP.BIC.isBlinkGap === true) {
      if (Pouch.adapters.websql) {
        return Promise.resolve('websql');
      }
    }
    if (idb && Pouch.adapters.idb) {
      return Promise.resolve('idb');
    }
    if (window.console && window.console.warn) {
      window.console.warn(msg);
    }
    return Promise.resolve(null);
  });
});
