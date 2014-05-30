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

    it("should exist", function () {
      should.exist(Collection);
    });

    describe('initialize()', function () {
      it("should trigger an initialization event when initialized");
      //it("should trigger an initialization event when initialized", function (done) {
        //collection = new Collection();
        //collection.once('initialize', done());
      //});

      it("should set up it's data object");
      //it("should set up it's data object", function () {
        //collection.should.have.property('data');
      //});

      // it("should have populated itself from the data store", function (done) {
      //   require(['data-pouch'], function (Data) {
      //     should.equal(Data.called, true);
      //     done();
      //   });
      // });
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
