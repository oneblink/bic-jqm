/*globals describe:false, it:false, before:false, after:false*/ // Mocha
/*globals assert:false*/ // Chai
define(['Squire'], function (Squire) {
  'use strict';

  var CONTEXT = 'tests/unit/promise-form.js';

  describe('expressionsTest', function () {
    var injector, promiseForm;

    before(function (done) {
      var cfg = JSON.parse(JSON.stringify(requirejs.s.contexts._.config));
      cfg.context = CONTEXT;
      require.config(cfg);
      injector = new Squire(CONTEXT);

      injector.require([
        'bic/promise-forms'
      ], function (PF) {
        promiseForm = PF;
        done();
      });
    });

    after(function () {
      injector.remove();
    });

    it('window.BMP.Expression exist', function (done) {
      assert(promiseForm);
      assert.isFunction(promiseForm);
      expect(window.BMP.Expression).to.not.exist;

      promiseForm().then(function () {
        expect(window.BMP.Expression).to.exist;
        expect(window.BMP.Expression.fn).to.exist;
        expect(window.BMP.Expression.fn.interaction).to.exist;
        expect(window.BMP.Expression.fn.suitcase).to.exist;
        done();
      });
    });

  });
});
