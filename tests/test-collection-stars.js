define(['Squire'], function (Squire) {
  "use strict";

  describe('Collection - Stars', function () {
    var injector, Collection, collection;

    before(function (done) {
      injector = new Squire();

      injector.mock('model-star', Backbone.Model);
      injector.mock('data-inMemory', function (param) {console.log(param)});

      injector.require(['../scripts/collection-stars'], function (required) {
        Collection = required;
        done();
      });
    });

    beforeEach(function (done) {
      collection = new Collection();
      done();
    });

    it("should exist", function () {
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
          return Promise.resolve()
        });
        done();
      });

      it("should return a promise", function () {
        expect(collection.load()).to.be.instanceOf(Promise);
      });

      it("should populate the datastore from cache", function (done) {
        collection.load().then(function () {
          expect(collection.data.readAll.called).to.be.true;
          done();
        });
      });
    });

    describe('clear(type)', function () {
      // it("should trigger model.destroy() on all models of given type", function (done) {
      //   require(['wrapper-backbone'], function (Backbone) {
      //     Backbone.sync.reset();
      //     collection.add({type: "test"}).clear("test");
      //     collection.length.should.equal(0);
      //     done();
      //   });
      // });

      // it("should ignore model not of given type", function (done) {
      //   require(['wrapper-backbone'], function (Backbone) {
      //     Backbone.sync.reset();
      //     collection.add({type: "nottest"}).clear("test");
      //     collection.length.should.equal(1);
      //     done();
      //   });
      // });
    });
  });
});
