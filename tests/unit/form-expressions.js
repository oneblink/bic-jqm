define(['Squire'], function (Squire) {
  'use strict';

  var CONTEXT = 'tests/unit/form-expressions.js';

  describe('Forms - Expressions', function () {
    var injector, mod;

    before(function (done) {
      var cfg = JSON.parse(JSON.stringify(requirejs.s.contexts._.config));
      cfg.context = CONTEXT;
      require.config(cfg);
      injector = new Squire(CONTEXT);

      window.BMP.Expression = { fn: {} };

      injector.mock('BlinkForms', {});
      injector.mock('bic/model/application', {
        datasuitcases: {
          get: function () {
            return { attributes: { data: 'AAA' } };
          }
        },
        router: {
          inheritanceChain: function () {
            return {
              prepareForView: function () {
                return Promise.resolve({ attributes: { content: 'AAA' } });
              }
            };
          }
        }
      });
      injector.require(['bic/form-expressions'], function (m) {
        mod = m;
        setTimeout(function () {
          done();
        }, 1000);
      });
    });

    after(function () {
      injector.remove();
      delete window.BMP.Expression;
    });

    beforeEach(function (done) {
      done();
    });

  //****** INTERACTION
    it('module.interaction', function () {
      expect(mod).to.have.property('interaction').that.is.an('function');
    });

    it('module.interaction should return promise', function () {
      expect(mod.interaction('AAA')).to.be.instanceOf(Promise);
    });

    it('module.interaction resolves with "AAA"', function (done) {
      mod.interaction('AAA').then(function (result) {
        assert.equal(result, 'AAA');
        done();
      });
    });

    //****** SUITCASE
    it('module.suitcase', function () {
      expect(mod).to.have.property('suitcase').that.is.an('function');
    });

    it('module.suitcase should return promise', function () {
      expect(mod.suitcase('AAA')).to.be.instanceOf(Promise);
    });

    it('module.suitcase resolves with "AAA"', function (done) {
      mod.suitcase('AAA').then(function (result) {
        assert.equal(result, 'AAA');
        done();
      });
    });

    it('BMP.Expression.fn', function () {
      assert.equal(window.BMP.Expression.fn.interaction, mod.interaction);
      assert.equal(window.BMP.Expression.fn.suitcase, mod.suitcase);
    });

  });

});
