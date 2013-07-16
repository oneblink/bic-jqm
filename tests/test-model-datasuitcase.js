/*global chai:true, describe:true, it:true, before: true, beforeEach:true, after:true, afterEach:true, expect:true, should:true, sinon:true */
// define('wrapper-backbone', [], function () {
//   "use strict";
//   return Backbone;
// });

// define('api-php', ['../../scripts/api-php'], function (API) {
//   "use strict";
//   var stub = sinon.stub(API);
//   return stub;
// });

define(function () {
  "use strict";
  describe('Model - DataSuitcase', function () {
    var Model, originalAPI;

    before(function (done) {
      require(['api'], function (API) {

        originalAPI = API;
        requirejs.undef('api');

        define('api', [], function () {
          return function (param) {console.log(param)};
        });
        
        require(['model-datasuitcase'], function (rModel) {
          Model = rModel;
          done();
        });
      });
    });

    after(function () {
      requirejs.undef('api');
      define('api', [], function () {return originalAPI; });
    });

    it("should exist", function () {
      should.exist(Model);
    });

    it("should be a constructor function", function () {
      Model.should.be.an.instanceOf(Function);
    });

    describe("idAttribute", function () {
      it("should be set to _id", function () {
        var model = new Model({_id: "TestID"});
        model.idAttribute.should.be.string("_id");
      });

      it("should be picked up by the model", function () {
        var model = new Model({_id: "TestID"});
        model.id.should.be.string("TestID");
      });
    });

    describe("populate()", function () {
      it("should do nothing if offline");

      it("should request a Data Suitcase from the api");

      it("should use a default contentTime of 0");

      it("should pass through the contentTime of last update if available");

      it("should stop on a blank response");

      it("should persist the fetched Data Suitcase");
    });
  });
});
