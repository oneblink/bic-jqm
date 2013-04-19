/*global chai:true, describe:true, it:true, before: true, beforeEach:true, after:true, afterEach:true, expect:true, should:true, sinon:true */
define('api-php', ['../scripts/api-php.js', 'jquery'], function (API, $) {
  "use strict";
  var stub = sinon.stub(API);
  // sinon.stub(API, "getAnswerSpace");
  // sinon.stub(API, "getInteraction");
  // sinon.stub(API, "getDataSuitcase");
  // sinon.stub(API, "getForm");
  stub.returns($.Deferred().promise());
  return stub;
});

define(['../scripts/data-pouch.js', 'backbone'],
  function (data, Backbone) {
    "use strict";
    describe('Data Abstraction Layer - PouchDB Implementation', function () {
      // describe('Backbone.sync', function () {
      //   it('should hijack the default Backbone.sync implementation', function () {
      //     Backbone.sync.toString().length.should.be.below('500');
      //   });
      //   it('should succesfully handle requests to Backbone.sync', function (done) {
      //     var ModelClass, model, promise;
      //     ModelClass = Backbone.Model.extend();
      //     model = new ModelClass();
      //     promise = model.fetch({});
      //     promise.fail(function () {
      //       done();
      //     });
      //   });
      // });
      describe('data object', function () {
        it('should be an object', function () {
          should.exist(data);
          data.should.be.an(Object);
        });
        it('should provide a function to fetch a model\'s contents from the server', function () {
          data.should.respondTo("getModel");
        });
        describe('data.getModel', function () {
          var application = new Backbone.Model({BICType: "AnswerSpace", siteName: "Exists"}),
            interaction = new Backbone.Model({BICType: "Interaction", siteName: "Exists"}),
            dataSuitcase = new Backbone.Model({BICType: "DataSuitcase", siteName: "Exists"}),
            form = new Backbone.Model({BICType: "Form", siteName: "Exists"});
          it('should handle an answerSpace fetch request', function () {

            application.set({BICtype: "AnswerSpace"});
            data.getModel(application).should.not.throw(Error);
          });
          it('should handle an Interaction fetch request', function () {
            data.getModel(application).should.not.throw(Error);
          });
          it('should handle a DataSuitcase fetch request');
          it('should handle a Form fetch request');
          it('should handle invalid fetch requests');
          it('should persist data using the IndexedDB implementation in web browsers');
          it('should persist data using the websql implementation in cordova');
          it('shoud fallback to ajax if in a web browser that doesn\'t support IndexedDB');
          it('shoud cache data in the persistant store for the length of time specified');
          it('shoud fetch the model again and update the persisted version if the cached model is stale');
        });
      });
    });
  });
