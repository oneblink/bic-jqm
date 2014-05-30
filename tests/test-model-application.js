define(['Squire'], function (Squire) {
  "use strict";

  describe('Model - Application', function () {
    var injector, model;


    before(function (done) {
      injector = new Squire();

      injector.mock('collection-interactions', Backbone.Collection);
      injector.mock('collection-datasuitcases', Backbone.Collection);
      injector.mock('collection-forms', Backbone.Collection);
      injector.mock('collection-pending', Backbone.Collection);
      injector.mock('collection-stars', Backbone.Collection);
      injector.mock('data-inMemory', function (param) {console.log(param)});
      injector.mock('domReady', function (param) {console.log(param)});
      injector.mock('api', function (param) {console.log(param)});
      //injector.mock('router', function (param) {console.log(param)});


      injector.require(['../scripts/model-application'], function (required) {
        model = required;
        done();
      });
    });

    it("should exist", function () {
      should.exist(model);
    });

    it("should be an instance of backbone model", function () {
      model.should.be.an.instanceOf(Backbone.Model);
    });

    describe('initialize()', function () {
      it("should set up it's data store");

      it("should create a collection for interactions");

      it("should create a collection for data suitcases");

      it("should create a collection for forms");

      it("should create a collection for pending items");

      it("should create a collection for stars");

      it("should trigger an 'initialize' event when this + all collections are fully initialized");
    });

    describe('populate()', function () {
      it("should do nothing if offline");

      it("should fetch the answerSpaceMap from API");

      it("should fill the interaction collection from map");

      it("should fill the answerSpace config from map");

      it("should parse interactions for data suitcases");

      it("should parse interactions for form objects");

      it("should trigger an 'initalize' event when complete");

      it("should return a promise");
    });
  });
});
