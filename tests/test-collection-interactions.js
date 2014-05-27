define(['Squire'], function (Squire) {
  "use strict";
  var Collection, collection;

  describe('Collection - Interactions', function () {
    var injector, Collection, collection;

    before(function (done) {
      injector = new Squire();

      injector.mock('model-interaction', Backbone.Model);
      injector.mock('data-inMemory', function (param) {console.log(param)});

      injector.require(['../scripts/collection-interactions'], function (required) {
        Collection = required;
        done();
      });
    });

    it("should exist", function () {
      should.exist(Collection);
    });

    describe('initialize()', function () {
      it("should trigger an initialization event when initialized", function (done) {
        collection = new Collection();
        collection.once('initialize', done());
      });

      it("should set up it's data object", function () {
        collection.should.have.property('data');
      });

      it("should have populated itself from the data store");

    });

    describe('save()', function () {
      it("should persist any models to the data store");
        // , function (done) {
        // Backbone.sync.reset();
        // collection.add({test: true}).save();
        // should.equal(Backbone.sync.called, true);
        // done();
      // });
    });
  });
});
