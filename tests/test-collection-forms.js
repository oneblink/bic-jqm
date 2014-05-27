define(['Squire'], function (Squire) {
  "use strict";

  describe('Collection - Forms', function () {
    var injector, Collection, collection;

    before(function (done) {
      injector = new Squire();

      injector.mock('model-application', Backbone.Model);
      injector.mock('model-form', Backbone.Model);
      injector.mock('data-inMemory', function (param) {console.log(param)});
      injector.mock('api', {});

      injector.require(['../scripts/collection-forms'], function (rCol) {
        Collection = rCol;
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

      it("should have created BlinkForms.getDefinition", function () {
          window.BlinkForms.should.have.property('getDefinition');
      });
    });
  });

  describe('BlinkForms.getDefinition(name, action)', function () {
    it("should create a valid form definition");
  });
});
