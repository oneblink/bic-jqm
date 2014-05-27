/*global chai:true, describe:true, it:true, before: true, beforeEach:true, after:true, afterEach:true, expect:true, should:true, sinon:true */
define(['Squire'], function (Squire) {
  describe('Collection - DataSuitcases', function () {
    var injector, Collection, collection;

    before(function (done) {
      injector = new Squire();
      injector.mock('model-datasuitcase', Backbone.Model);
      injector.mock('data-inMemory', function (param) {console.log(param)});
      injector.require(['../scripts/collection-datasuitcases'], function (required) {
        Collection = required;
        done();
      });
    });
    
    beforeEach(function (done) {
      collection = new Collection();
      done();
    });

    it("should exist", function () {
      should.exist(collection);
    });

    describe('initialize()', function (done) {
      it("should provide a promise that is resolved when initialization is complete", function () {
        collection.should.have.property('initialize');
        collection.initialize.always(function () {
          done();
        });
      });

      it("should set up it's data object", function () {
        collection.should.have.property('data');
      });

      it("should have populated itself from the data store");
    });
  });
});
