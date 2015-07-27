define(function () {
  'use strict';

  // foreign modules

  var deadline = require('@jokeyrhyme/deadline');
  var Promise = require('bic/promise');;

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
      if (window.console && window.console.error) {
        window.console.error('BMP.BlinkGap.whenReady()', err);
      }
      return Promise.resolve();
    });
  }

  return Promise.resolve();
});
