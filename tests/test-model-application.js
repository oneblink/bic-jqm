/*global chai:true, describe:true, it:true, before: true, beforeEach:true, after:true, afterEach:true, expect:true, should:true, sinon:true */
define(['Squire'], function (Squire) {
  "use strict";

  describe('Model - Application', function () {
    var injector, model, siteMap, loginStatus;


    before(function (done) {
      siteMap = {};
      loginStatus = {};

      var CollectionMock = Backbone.Collection.extend({
        model: Backbone.Model.extend({
          idAttribute: '_id',
          populate: function () {
            return true;
          }
        }),
        datastore: function () {
          return this;
        },
        events: function () {
          return this;
        },
        load: function () {
          return Promise.resolve();
        },
        save: function () {
          return true;
        }
      });

      injector = new Squire();

      injector.mock('collection-interactions', CollectionMock);
      injector.mock('collection-datasuitcases', CollectionMock);
      injector.mock('collection-forms', CollectionMock);
      injector.mock('collection-pending', CollectionMock);
      injector.mock('collection-stars', CollectionMock);
      injector.mock('collection-form-records', CollectionMock);
      injector.mock('domReady', function () { return null; });

      injector.mock('api-web', {
        getAnswerSpaceMap: function () { return Promise.resolve(siteMap); },
        getLoginStatus: function () { return Promise.resolve(loginStatus); }
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

    describe('#collections', function () {
      afterEach(function (done) {
        delete model.interactions;
        delete model.datasuitcases;
        delete model.forms;
        delete model.pending;
        delete model.stars;
        delete model.formRecords;
        done();
      });

      it("should return a promise", function () {
        expect(model.collections()).to.be.instanceOf(Promise);
      });

      it("should create a collection for interactions", function () {
        model.collections();
        expect(model).to.have.property('interactions');
      });

      it("should create a collection for data suitcases", function () {
        model.collections();
        expect(model).to.have.property('datasuitcases');
      });

      it("should create a collection for forms", function () {
        model.collections();
        expect(model).to.have.property('forms');
      });

      it("should create a collection for pending items", function () {
        model.collections();
        expect(model).to.have.property('pending');
      });

      it("should create a collection for stars", function () {
        model.collections();
        expect(model).to.have.property('stars');
      });

      it("should create a collection for form records", function () {
        model.collections();
        expect(model).to.have.property('formRecords');
      });

      it("should resolve when the collections are all ready", function (done) {
        model.collections().then(function () {
          done();
        });
      });
    });

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
      before(function (done) {
        model.collections().then(function () {
          done();
        });
      });

      beforeEach(function (done) {
        siteMap = {};
        done();
      });

      it("should do nothing if offline");

      it("should fetch the answerSpaceMap from API", function (done) {
        model.populate().then(function () {
          done();
        });
      });

      it("should fill the interaction collection from map", function (done) {
        siteMap = JSON.parse('{"map":{"interactions":[1]},"i1":{"pertinent":{"name":"one"}}}');
        model.populate().then(function () {
          expect(model.interactions.length).to.equal(1);
          done();
        });
      });

      it("should fill the answerSpace config from map", function (done) {
        siteMap = JSON.parse('{"a1":{"pertinent":{"cat":"hat"}}}');
        model.populate().then(function () {
          expect(model.get('cat')).to.equal('hat');
          done();
        });
      });

      it("should parse interactions for data suitcases", function (done) {
        siteMap = JSON.parse('{"map":{"interactions":[1]},"i1":{"pertinent":{"name":"one","xml":"test"}}}');
        model.populate().then(function () {
          expect(model.datasuitcases.length).to.equal(1);
          done();
        });
      });

      it("should trigger an 'initialize' event when complete", function (done) {
        model.once('initialize', function () {
          done();
        });
        model.populate();
      });

      it("should delete items from the DB when they are removed from the sitemap", function (done) {
        siteMap = JSON.parse('{"map":{"interactions":[1,2,3]},"i1":{"pertinent":{"name":"one"}},"i2":{"pertinent":{"name":"two"}},"i3":{"pertinent":{"name":"three"}}}');
        model.populate().then(function () {
          expect(model.interactions.length).to.equal(3);
          siteMap = JSON.parse('{"map":{"interactions":[1]},"i1":{"pertinent":{"name":"one"}}}');
          model.populate().then(function () {
            expect(model.interactions.length).to.equal(1);
            done();
          });
        });
      });

      it("should return a promise", function () {
        expect(model.populate()).to.be.instanceOf(Promise);
      });
    });

    describe('#checkLoginStatus', function () {
      before(function (done) {
        model.collections().then(function () {
          done();
        });
      });

      it("should return a promise", function () {
        model.set('loginStatus', 'cats!');
        loginStatus = 'cats!';
        expect(model.checkLoginStatus()).to.be.instanceOf(Promise);
      });

      it("should destroy all the collections if login status differs from the saved state", function (done) {
        siteMap = JSON.parse('{"map":{"interactions":[1]},"i1":{"pertinent":{"name":"one"}}}');
        model.populate().then(function () {
          expect(model.interactions.length).to.equal(1);
          loginStatus = 'hats!';
          siteMap = {};
          model.checkLoginStatus().then(function () {
            expect(model.interactions.length).to.equal(0);
            done();
          });
        });
      });
    });

    describe('#initialRender', function () {
      it("should do things, wonderous things");
    });
  });
});
