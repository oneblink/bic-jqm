/*global chai:true, describe:true, it:true, before: true, beforeEach:true, after:true, afterEach:true, expect:true, should:true, sinon:true */
define(['Squire'], function (Squire) {
  "use strict";

  describe('Model - Application', function () {
    var injector, model;


    before(function (done) {
      var collectionMock = Backbone.Collection.extend();
      collectionMock.datastore = function () {
        return this;
      };
      collectionMock.load = function () {
        return Promise.resolve();
      };
      collectionMock.events = function () {
        return this;
      };
      collectionMock.download = function () { return null; };
      collectionMock.reset = function () { return null; };

      injector = new Squire();

      injector.mock('collection-interactions', collectionMock);
      injector.mock('collection-datasuitcases', collectionMock);
      injector.mock('collection-forms', collectionMock);
      injector.mock('collection-pending', collectionMock);
      injector.mock('collection-stars', collectionMock);
      injector.mock('collection-form-records', collectionMock);
      injector.mock('domReady', function () { return null; });
      injector.mock('feature!api', {
        getAnswerSpaceMap: function () { return Promise.resolve([]); },
        getLoginStatus: function () { return Promise.resolve({}); }
      });

      injector.require(['../scripts/model-application.js'], function (required) {
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

    describe('#datastore', function () {
      afterEach(function (done) {
        if (model.data) {
          delete model.data;
        }
        done();
      });

      it('should return itself', function () {
        expect(model.datastore()).to.be.equal(model);
      });

      it("should set up a data store", function () {
        model.datastore();
        expect(model).to.have.property('data');
      });
    });

    // describe('#collections', function () {
    //   beforeEach(function (done) {
    //     done();
    //   });
    //
    //   afterEach(function (done) {
    //     delete model.interactions;
    //     delete model.datasuitcases;
    //     delete model.forms;
    //     delete model.pending;
    //     delete model.stars;
    //     delete model.formRecords;
    //     done();
    //   });
    //
    //   it("should return a promise", function () {
    //     expect(model.collections()).to.be.instanceOf(Backbone.Collection);
    //   });
    //
    //   it("should create a collection for interactions", function () {
    //     model.collections();
    //     expect(model).to.have.property('interactions');
    //   });
    //
    //   it("should create a collection for data suitcases", function () {
    //     model.collections();
    //     expect(model).to.have.property('datasuitcases');
    //   });
    //
    //   it("should create a collection for forms", function () {
    //     model.collections();
    //     expect(model).to.have.property('forms');
    //   });
    //
    //   it("should create a collection for pending items", function () {
    //     model.collections();
    //     expect(model).to.have.property('pending');
    //   });
    //
    //   it("should create a collection for stars", function () {
    //     model.collections();
    //     expect(model).to.have.property('stars');
    //   });
    //
    //   it("should create a collection for form records", function () {
    //     model.collections();
    //     expect(model).to.have.property('formRecords');
    //   });
    //
    //   it("should resolve when the collections are all ready", function (done) {
    //     model.collections().then(function () {
    //       done();
    //     });
    //   });
    // });

    describe('#setup', function () {
      before(function (done) {
        model.datastore();
        sinon.stub(model.data, 'read', function () {
          return Promise.resolve();
        });
        done();
      });

      after(function (done) {
        model.data.read.restore();
        done();
      });

      it("should return a promise", function () {
        expect(model.setup()).to.be.instanceOf(Promise);
      });


      it("should read from it's data store", function (done) {
        model.setup().then(function () {
          expect(model.data.read.called).to.equal(true);
          done();
        });
      });
    });

    describe('#populate', function () {
      it("should do nothing if offline");

      it("should fetch the answerSpaceMap from API");

      it("should fill the interaction collection from map");

      it("should fill the answerSpace config from map");

      it("should parse interactions for data suitcases");

      it("should parse interactions for form objects");

      it("should trigger an 'initalize' event when complete");

      it("should remove items from the collection when they are no longer present in the sitemap", function (done) {
        var callback, callbackTwo;

        callbackTwo = function () {
          // Check that objects from the first round have been deleted
          done();
        };

        callback = function () {
          console.log('Made it to callback');
          // Check that all the models we expect are in the collection
          // Modify the answerSpaceMap then run again
          injector.mock('feature!api', {
            getAnswerSpaceMap: function () { return Promise.resolve('{"map":{"interactions":[1],"i1":{"pertinent":{"name":"one"}}}}'); }
          });
          model.populate().then(callbackTwo, callbackTwo);
        };

        injector.mock('feature!api', {
          getAnswerSpaceMap: function () { return Promise.resolve('{"map":{"interactions":[1,2,3],"i1":{"pertinent":{"name":"one"}},"i2":{"pertinent":{"name":"two"}},"i3":{"pertinent":{"name":"three"}}}}'); }
        });

        model.populate().then(callback, callback);
      });

      it("should return a promise");
    });

    // describe('#checkLoginStatus', function () {
    //   before(function (done) {
    //     model.collections().then(function () {
    //       done();
    //     });
    //   });
    //
    //   it("should return a promise");//, function () {
    //     // Temporarily disabling as it causes side effects that break tests
    //     //expect(model.checkLoginStatus()).to.be.instanceOf(Promise);
    //   //});
    // });

    describe('#initialRender', function () {
      it("should do things, wonderous things");
    });
  });
});
