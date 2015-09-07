define(function (require) {
  'use strict';

  // foreign modules

  var domReady = require('domReady');
  var Promise = require('bic/promise');

  // local modules

  var c = require('bic/console');

  // this module

  return new Promise(function (resolve) {
    domReady(function () {
      c.debug('event: domReady');
      resolve();
    });
  });
});
