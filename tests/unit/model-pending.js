define(['Squire'], function (Squire) {
  'use strict';

  describe('Model - Pending', function () {
    var injector, Model;

    before(function (done) {
      injector = new Squire();

      injector.require(['../scripts/model-pending'], function (required) {
        Model = required;
        done();
      });
    });

    it('should exist', function () {
      should.exist(Model);
    });

    it('should be a constructor function', function () {
      Model.should.be.an.instanceOf(Function);
    });

    describe('idAttribute', function () {
      it('should be set to _id', function () {
        var model = new Model({_id: 'TestID'});
        model.idAttribute.should.be.string('_id');
      });

      it('should be picked up by the model', function () {
        var model = new Model({_id: 'TestID'});
        model.id.should.be.string('TestID');
      });
    });
  });
});
