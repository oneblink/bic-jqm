define(['Squire', 'backbone', 'sinon', 'chai'], function (Squire, Backbone, sinon, chai) {
  'use strict';

  var CONTEXT = 'tests/unit/collection/interactions.js';
  var should = chai.should();

  describe('Collection - Interactions', function () {
    var injector, Collection, collection;

    before(function (done) {
      var cfg = JSON.parse(JSON.stringify(requirejs.s.contexts._.config));
      cfg.context = CONTEXT;
      require.config(cfg);
      injector = new Squire(CONTEXT);

      // import global `require('dep')` into local `injector.require('dep')`
      injector.mock('backbone', Backbone);

      injector.mock('bic/model/interaction', Backbone.Model);

      injector.require(['bic/collection/interactions'], function (required) {
        Collection = required;
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
        });
      });
    });

    describe('#save', function () {
      it('should persist any models to the data store');
    });

    describe('#getFormActions', function () {
      var data = [
        new Backbone.Model({blinkFormObjectName: 'a', blinkFormAction: 'add', extra: '1'}),
        new Backbone.Model({blinkFormObjectName: 'a', blinkFormAction: 'edit', extra: '2'}),
        new Backbone.Model({blinkFormObjectName: 'a', blinkFormAction: 'view', extra: '3'}),
        new Backbone.Model({blinkFormObjectName: 'b', blinkFormAction: 'add', extra: '4'})
      ];
      var c;

      before(function () {
        c = new Collection(data);
      });

      it('should return 3 full records', function () {
        var result = c.getFormActions('a');
        assert.lengthOf(Object.keys(result), 3);
        Object.keys(result).forEach(function (key, index) {
          assert.deepEqual(result[key], data[index]);
        });
      });

      it('should return 1 record with correct transform', function () {
        var action = c.getFormActions('b', function (interaction) {
          return 'it works!';
        });

        assert.lengthOf(Object.keys(action), 1);
        assert.equal(action.add, 'it works!');
      });
    });
  });
});
