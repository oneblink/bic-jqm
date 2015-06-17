define(function () {
  'use strict';

  var realPromise; // not jQuery.Deferred, yuck!

  if (window.BMP && window.BMP.BlinkGap && window.BMP.BlinkGap.isHere && window.BMP.BlinkGap.isHere()) {

    // convert jQuery.Deferred to an ES6 Promise so we can safely chain it
    realPromise = Promise.resolve(window.BMP.BlinkGap.whenReady());

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
