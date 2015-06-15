define(['Squire'], function (Squire) {
  'use strict';

  describe('Collection - Forms', function () {
    var injector;

    before(function (done) {
      injector = new Squire();

      injector.require(['form-dependencies'], function () {
        setTimeout(function() {
          done();
        }, 1000);
      });
    });

    beforeEach(function (done) {
      done();
    });

  //****** INTERACTION
    it('should define BMP.Expression.fn.interaction', function () {
      setTimeout(function() {
        expect(BMP.Expression.fn).to.have.property('interaction').that.is.an('function');
      }, 100);
    });

    it('BMP.Expression.fn.interaction should return promise', function () {
      setTimeout(function() {
        expect(BMP.Expression.fn.interaction('AAA')).to.be.instanceOf(Promise);
      }, 1000);
    });


    //****** SUITCASE
    it('should define BMP.Expression.fn.suitcase', function () {
      setTimeout(function() {
        expect(BMP.Expression.fn).to.have.property('suitcase').that.is.an('function');
      }, 1000);
    });

    it('BMP.Expression.fn.suitcase should return promise', function () {
      setTimeout(function() {
        expect(BMP.Expression.fn.suitcase('AAA')).to.be.instanceOf(Promise);
      }, 1000);
    });
  });


});
