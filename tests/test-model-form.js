/*global chai:true, describe:true, it:true, before: true, beforeEach:true, after:true, afterEach:true, expect:true, should:true, sinon:true */
define(['Squire'], function (Squire) {
  "use strict";
  describe('Model - Form', function () {
    var injector, Model;

    before(function (done) {
      injector = new Squire();

      injector.mock('api', function () { return null; });

      injector.require(['../scripts/model-form'], function (required) {
        Model = required;
        done();
      });
    });

    it("should exist", function () {
      should.exist(Model);
    });

    describe("populate()", function () {
      it("should do nothing if offline");

      it("should get a form definition from the api");

      it("should save the form definition the the data store");
    });
  });
});
