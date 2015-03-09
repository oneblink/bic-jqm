define(['Squire'], function (Squire) {
  'use strict';
  describe('Model - Form', function () {
    var injector, Model;

    before(function (done) {
      injector = new Squire();

      injector.mock('feature!api', function () { return null; });

      injector.require(['../src/model-form'], function (required) {
        Model = required;
        done();
      });
    });

    it('should exist', function () {
      should.exist(Model);
    });

    describe('populate()', function () {
      it('should do nothing if offline');

      it('should get a form definition from the api');

      it('should save the form definition the the data store');
    });
  });
});
