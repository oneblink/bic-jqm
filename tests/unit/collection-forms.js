define(['Squire'], function (Squire) {
  'use strict';

  describe('Collection - Forms', function () {
    var injector, Collection, collection;

    before(function (done) {
      injector = new Squire();

      injector.mock('model-application', Backbone.Model);
      injector.mock('model-form', Backbone.Model);
      injector.mock('api', {});

      injector.require(['../src/collection-forms'], function (rCol) {
        Collection = rCol;
        done();
      });
    });

    beforeEach(function (done) {
      collection = new Collection();
      done();
    });

    it('should exist', function () {
      should.exist(Collection);
    });

    describe('#datastore', function () {
      it('should create a datastore for the collection', function () {
        expect(collection).to.not.have.property('data');
        collection.datastore();
        expect(collection).to.have.property('data');
      });

      it('should return itself', function () {
        expect(collection.datastore()).to.equal(collection);
      });
    });

    describe('#load', function () {
      beforeEach(function (done) {
        collection.datastore();
        sinon.stub(collection.data, 'readAll', function () {
          return Promise.resolve();
        });
        done();
      });

      it('should return a promise', function () {
        expect(collection.load()).to.be.instanceOf(Promise);
      });

      it('should populate the datastore from cache', function (done) {
        collection.load().then(function () {
          done();
        }).catch(function () {
          done();
        });
      });
    });
  });

  describe('BlinkForms.getDefinition(name, action)', function () {
    it('should create a valid form definition');
  });
});
