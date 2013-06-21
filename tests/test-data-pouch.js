/*global chai:true, describe:true, it:true, before: true, beforeEach:true, after:true, afterEach:true, expect:true, should:true, sinon:true */
define('api-php', ['../../scripts/api-php.js', 'jquery'], function (API, $) {
  "use strict";
  // var stub = sinon.stub(API),
  //   promise = $.Deferred().resolve().promise();
  // stub.getAnswerSpace.returns(promise);
  // stub.getInteraction.returns(promise);
  // stub.getDataSuitcase.returns(promise);
  // stub.getForm.returns(promise);
  // return stub;
});

define(function () {
    "use strict";
    describe('Data Abstraction Layer - PouchDB Implementation', function () {
      var data;

      before(function (done) {
        require(['data-pouch'], function (rData) {
          data = rData;
          done();
        });
      });

      describe('new Data(name)', function () {
        it("should create a new instance of the Data layer");

        it("should namespace all DB's with name");
      });

      describe('dbAdapter()', function () {
        it("should detect if in native app and use websql");

        it("should detect if indexeddb is available and use it");

        it("should return false if no indexeddb and not native");
      });

      describe('create(model)', function () {
        it("should generate an ID for the model");

        it("should create model in the DB");

        it("should resolve the model");

        it("should throw error at the slightest problem");

        it("should return a promise");
      });

      describe('update(model)', function () {
        it("should create model in the DB if given ID");

        it("should update model in the DB if given ID and REV");

        it("should resolve the model");

        it("should throw error at the slightest problem");

        it("should return a promise");
      });

      describe('read(model)', function () {
        it("should find and resolve model");

        it("should throw error at the slightest problem");

        it("should return a promise");
      });

      describe('readAll()', function () {
        it("should find and resolve all models in db");

        it("should throw error at the slightest problem");

        it("should return a promise");
      });

      describe('delete(model)', function () {
        it("should delete model from db");

        it("should throw error at the slightest problem");

        it("should return a promise");
      });

      describe('deleteAll(model)', function () {
        it("should destroy the DB");

        it("should throw error at the slightest problem");

        it("should return a promise");
      });
  });
});