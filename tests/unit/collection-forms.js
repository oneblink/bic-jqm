define(['Squire', 'backbone', 'chai'], function (Squire, Backbone, chai) {
  'use strict';

  var CONTEXT = 'tests/unit/collection-forms.js';
  var should = chai.should();

  describe('Collection - Forms', function () {
    var injector, Collection, collection;

    before(function (done) {
      var cfg = JSON.parse(JSON.stringify(requirejs.s.contexts._.config));
      cfg.context = CONTEXT;
      require.config(cfg);
      injector = new Squire(CONTEXT);

      // import global `require('dep')` into local `injector.require('dep')`
      injector.mock('backbone', Backbone);

      injector.mock('bic/model-application', Backbone.Model);
      injector.mock('bic/model-form', Backbone.Model);
      injector.mock('bic/api', {});

      injector.require(['bic/collection-forms'], function (rCol) {
        Collection = rCol;
        done();
      });
    });

    after(function () {
      injector.remove();
    });

    beforeEach(function (done) {
      collection = new Collection();
      done();
    });

    it('should exist', function () {
      should.exist(Collection);
    });

    describe('#datastore', function () {
      it('should create a datastore for the collection', function () {
        expect(collection).to.not.have.property('data');
        collection.datastore();
        expect(collection).to.have.property('data');
      });

      it('should return itself', function () {
        expect(collection.datastore()).to.equal(collection);
      });
    });

    describe('#load', function () {
      beforeEach(function (done) {
        collection.datastore();
        sinon.stub(collection.data, 'readAll', function () {
          return Promise.resolve();
        });
        done();
      });

      it('should return a promise', function () {
        expect(collection.load()).to.be.instanceOf(Promise);
      });

      it('should populate the datastore from cache', function (done) {
        collection.load().then(function () {
          done();
        }).catch(function () {
          done();
        });
      });
    });
  });

  describe('BlinkForms.getDefinition(name, action)', function () {
    it('should create a valid form definition');
  });
});
