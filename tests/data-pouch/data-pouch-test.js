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

define(['../../scripts/data-pouch.js', 'backbone', 'jquery'],
  function (data, Backbone, $) {
    "use strict";
    describe('Data Abstraction Layer - PouchDB Implementation', function () {});
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
    //   describe('data object', function () {
    //     it('should be an object', function () {
    //       should.exist(data);
    //       //data.should.be.an(Object);
    //     });
    //     it('should provide a function to fetch a model\'s contents from the server', function () {
    //       data.should.respondTo("getModel");
    //     });
    //     describe('data.getModel', function () {
    //       var application = new Backbone.Model({BICType: "AnswerSpace", siteName: "Exists"}),
    //         interaction = new Backbone.Model({BICType: "Interaction", siteName: "Exists"}),
    //         dataSuitcase = new Backbone.Model({BICType: "DataSuitcase", siteName: "Exists"}),
    //         form = new Backbone.Model({BICType: "Form", siteName: "Exists"}),
    //         invalid = new Backbone.Model({BICType: "Cat", siteName: "Exists"}),
    //         callback = false,
    //         options = {
    //           success: function (model, doc, options) {
    //             should.exist(model);
    //             should.exist(doc);
    //             should.exist(options);
    //             callback = true;
    //           },
    //           error: function (model, doc, options) {
    //             should.exist(model);
    //             should.exist(options);
    //             callback = true;
    //           }
    //         };
    //       beforeEach(function () {
    //         options.dfrd = $.Deferred();
    //       });

    //       it('should return a promise');
    //       it('should trigger promise.done');
    //       it('should trigger promise.fail');
    //       it('should trigger a success callback when appropriate');
    //       it('should trigger an error callback when appropriate');

    //       it('should handle an answerSpace fetch request', function (done) {
    //         data.getModel(application, options);
    //         options.dfrd.then(function (doc) {
    //           should.exist(doc);
    //           done();
    //         }, function (error) {
    //           done();
    //         });
    //       });

    //       it('should handle an Interaction fetch request', function (done) {
    //         data.getModel(interaction, options);
    //         options.dfrd.then(function (doc) {
    //           should.exist(doc);
    //           done();
    //         }, function (error) {
    //           done();
    //         });
    //       });

    //       it('should handle an Interaction fetch request that uses POST data');

    //       it('should handle a DataSuitcase fetch request', function (done) {
    //         data.getModel(dataSuitcase, options);
    //         options.dfrd.then(function (doc) {
    //           should.exist(doc);
    //           done();
    //         }, function (error) {
    //           done();
    //         });
    //       });

    //       it('should handle a Form fetch request', function (done) {
    //         data.getModel(form, options);
    //         options.dfrd.then(function (doc) {
    //           should.exist(doc);
    //           done();
    //         }, function (error) {
    //           done();
    //         });
    //       });

    //       it('should handle invalid fetch requests', function (done) {
    //         data.getModel(invalid, options);
    //         options.dfrd.then(function (doc) {
    //           should.exist(doc);
    //           done();
    //         }, function (error) {
    //           done();
    //         });
    //       });

    //       it('should persist data using the IndexedDB implementation in web browsers');
    //       it('should persist data using the websql implementation in cordova');
    //       it('shoud fallback to ajax if in a web browser that doesn\'t support IndexedDB');
    //       it('shoud cache data in the persistant store for the length of time specified');
    //       it('shoud fetch the model again and update the persisted version if the cached model is stale');
    //     });
    //   });
    // });
  });
