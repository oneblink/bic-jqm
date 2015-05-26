define(function () {
  'use strict';

  if (window.BMP && window.BMP.BlinkGap && window.BMP.BlinkGap.isHere && window.BMP.BlinkGap.isHere()) {

    /** @type {Promise} always resolved, never rejected */
    return window.BMP.BlinkGap.whenReady().then(null, function () {
      return Promise.resolve();
    });
  }

  return Promise.resolve();
});
