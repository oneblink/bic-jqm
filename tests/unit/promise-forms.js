/*globals describe:false, it:false, before:false, after:false*/ // Mocha
/*globals assert:false*/ // Chai
define(['Squire', 'chai'], function (Squire, chai) {
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
      assert.isUndefined(window.BMP.Expression);

      promiseForm().then(function () {
        assert.isDefined(window.BMP.Expression);
        assert.isDefined(window.BMP.Expression.fn);
        assert.isDefined(window.BMP.Expression.fn.interaction);
        assert.isDefined(window.BMP.Expression.fn.suitcase);
        done();
      });
    });
  });
});
