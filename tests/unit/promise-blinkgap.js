/*globals define:false, require:false, requirejs:false*/ // Require.js
/*globals describe:false, it:false, before:false, after:false*/ // Mocha
/*globals assert:false*/ // Chai
define(['Squire'], function (Squire) {
  'use strict';

  var CONTEXT = 'tests/unit/promise-blinkgap.js';

  describe('whenBlinkGapReady', function () {

    var injector, promise;

    before(function (done) {
      var cfg = JSON.parse(JSON.stringify(requirejs.s.contexts._.config));
      cfg.context = CONTEXT;
      require.config(cfg);
      injector = new Squire(CONTEXT);

      // fake BlinkGap environment for these tests
      window.isBlinkGap = true;
      window.cordova = { available: true };

      injector.require(['promise-blinkgap'], function (p) {
        promise = p;
        done();
      });
    });

    after(function () {
      injector.remove();
      window.isBlinkGap = false;
      delete window.cordova;
    });

    it('module exports a Promise-like Object', function (done) {
      assert(promise);
      assert.isFunction(promise.then);
      promise.then(function () {
        done();
      });
    });

    it('promise can be chained', function (done) {
      promise.then(function () {
        return Promise.resolve('abc');
      }).then(function (result) {
        // this fails if promise is a jQuery.Deferred
        assert.equal(result, 'abc');
        done();
      });
    });

  });
});
