/*global chai:true, describe:true, it:true, before: true, beforeEach:true, after:true, afterEach:true, expect:true, should:true, sinon:true */
define('wrapper-backbone', ['backbone'], function (Backbone) {
  "use strict";
  return Backbone;
});

define(['../../scripts/model-pending-mobile.js'],
  function (Model) {
    "use strict";
    describe('Model - Pending', function () {
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
    });
  });
