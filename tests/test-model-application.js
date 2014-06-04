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
      injector.mock('domReady', function (param) {console.log(param)});
      injector.mock('api', function (param) {console.log(param)});

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
      beforeEach(function (done) {
        done();
      });

      afterEach(function (done) {
        delete model.interactions;
        delete model.datasuitcases;
        delete model.forms;
        delete model.pending;
        delete model.stars;
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

      it("should resolve when the collections are all ready", function (done) {
        model.collections().then(function () {
          done();
        });
      })
    });

    describe('#setup', function (done) {
      before(function (done) {
        model.datastore();

        sinon.stub(model, 'populate', function () {
          return Promise.resolve();
        });
        sinon.stub(model.data, 'read', function () {
          return Promise.resolve()
        });
        done();
      });

      after(function (done) {
        model.populate.restore();
        model.data.read.restore();
        done();
      });

      it("should return a promise", function () {
        expect(model.setup()).to.be.instanceOf(Promise);
      });


      it("should read from it's data store", function (done) {
        model.setup().then(function () {
          expect(model.data.read.called).to.be.true;
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

      it("should return a promise");
    });

    describe('#checkLoginStatus', function () {
      it("should return a promise", function () {
        expect(model.checkLoginStatus()).to.be.instanceOf(Promise);
      });
    });

    describe('#initialRender', function () {
    });
  });
});
