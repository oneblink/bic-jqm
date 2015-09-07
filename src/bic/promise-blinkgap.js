define(function (require) {
  'use strict';

  // foreign modules

  var deadline = require('@jokeyrhyme/deadline');
  var Promise = require('bic/promise');

  // local modules

  var c = require('bic/console');

  // this module

  var realPromise; // not jQuery.Deferred, yuck!

  require('jquery'); // quick fix, .whenReady() need jQuery to be loaded

  if (window.BMP && window.BMP.BlinkGap && window.BMP.BlinkGap.isHere && window.BMP.BlinkGap.isHere()) {
    // convert jQuery.Deferred to an ES6 Promise so we can safely chain it
    realPromise = Promise.resolve(window.BMP.BlinkGap.whenReady());

    // wait a maximum of 5 seconds for this to be resolved
    realPromise = deadline.promise(realPromise, 5e3);

    /** @type {Promise} always resolved, never rejected */
    return realPromise.then(null, function (err) {
      c.error('BMP.BlinkGap.whenReady()');
      c.error(err);
      return Promise.resolve();
    });
  }

  return Promise.resolve();
});
