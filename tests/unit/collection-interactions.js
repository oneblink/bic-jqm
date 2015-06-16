define(['Squire', 'backbone', 'sinon'], function (Squire, Backbone, sinon) {
  'use strict';
  describe('Collection - Interactions', function () {
    var injector, Collection, collection;

    before(function (done) {
      injector = new Squire();

      injector.mock('bic/model-interaction', Backbone.Model);

      injector.require(['bic/collection-interactions'], function (required) {
        Collection = required;
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
        });
      });
    });

    describe('#save', function () {
      it('should persist any models to the data store');
    });
  });
});
