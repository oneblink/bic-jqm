define(['Squire'], function (Squire) {
  "use strict";
  describe('Collection - Pending', function () {
    var injector, Collection, collection;

    before(function (done) {
      injector = new Squire();

      injector.mock('model-pending', Backbone.Model);
      injector.mock('data-inMemory', function (param) {console.log(param)});
      injector.mock('api', function (param) {console.log(param)});

      injector.require(['../scripts/collection-pending'], function (required) {
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

      // it("should have populated itself from the data store", function () {
      //   should.equal(Data.called, true);
      // });
    });

    describe('processQueue()', function () {
      it("should do nothing when offline");

      it("should send pending items to the server when online");

      it("should remove items from the queue after sucessful submission");

      it("should keep items in the queue after failed submission");

      it("should retain draft items");
    });
  });
});
