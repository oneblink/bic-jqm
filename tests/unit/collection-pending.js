define(['Squire', 'sinon', 'backbone', 'chai', 'jquery', 'bic/enum-model-status'], function (Squire, sinon, Backbone, chai, $, MODEL_STATUS) {
  'use strict';

  var CONTEXT = 'tests/unit/collection/pending.js';
  var should = chai.should();

  describe('Collection - Pending', function () {
    var injector, Collection, collection, apiStub;

    before(function (done) {
      var cfg = JSON.parse(JSON.stringify(requirejs.s.contexts._.config));
      cfg.context = CONTEXT;
      require.config(cfg);
      injector = new Squire(CONTEXT);

      // import global `require('dep')` into local `injector.require('dep')`
      injector.mock('backbone', Backbone);
      injector.mock('BlinkForms', {
        errorHelpers: {
          fromBMP: function () {
            return 1;
          }
        }
      });

      apiStub = sinon.stub();

      //the api files return jQuery deferred objects, not native promises
      // this is not obvious until you need to catch a failure in the tests
      //apiStub.returns(Promise.resolve());

      //injector.mock('bic/model-pending', Backbone.Model);
      injector.mock('bic/api/web', {
        setPendingItem: apiStub
      });

      injector.require(['bic/collection/pending'], function (required) {
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

    describe('processQueue()', function () {
      beforeEach(function () {
        /*eslint-disable new-cap */
        var deferred = $.Deferred();
        /* eslint-enable new-cap*/
        deferred.resolve();
        apiStub.returns(deferred);
      });

      afterEach(function () {
        apiStub.reset();
      });

      it('should do nothing when offline');

      it('should send pending items to the server when online', function () {
        expect(apiStub.called).to.equal(false);
        collection.add({
          status: MODEL_STATUS.PENDING,
          name: 'test',
          action: 'test',
          data: {}
        });
        expect(collection.length).to.equal(1);
        collection.processQueue();
        expect(apiStub.called).to.equal(true);
      });

      it('should change an items status to submitted after successful submission', function (done) {
        expect(apiStub.called).to.equal(false);
        collection.add({
          status: MODEL_STATUS.PENDING,
          name: 'test',
          action: 'test',
          data: {}
        });
        expect(collection.length).to.equal(1);

        collection.processQueue().then(function () {
          expect(collection.length).to.equal(1);
          expect(apiStub.called).to.equal(true);
          expect(collection.models[0].get('status')).to.equal(MODEL_STATUS.SUBMITTED);
          done();
        });
      });

      it('should keep items in the queue (as pending) after failed submission', function (done) {
        /*eslint-disable new-cap */
        var deferred = $.Deferred();
        /* eslint-enable new-cap*/
        deferred.reject();
        apiStub.returns(deferred);

        expect(apiStub.called).to.equal(false);
        collection.add({
          status: MODEL_STATUS.PENDING,
          name: 'test',
          action: 'test',
          data: {}
        });

        expect(collection.length).to.equal(1);

        collection.processQueue().then(undefined, function () {
          expect(collection.length).to.equal(1);
          expect(apiStub.called).to.equal(true);
          expect(collection.models[0].get('status')).to.equal(MODEL_STATUS.PENDING);
          done();
        });
      });

      it('should keep items in the queue if they fail server side validation', function (done) {
        /*eslint-disable new-cap */
        var deferred = $.Deferred();
        /* eslint-enable new-cap*/
        var data = {
          responseText: JSON.stringify({
            message: 'failed server side validation',
            errors: 'lots'
          })
        };
        deferred.reject(data, 'error');
        apiStub.returns(deferred);

        expect(apiStub.called).to.equal(false);
        collection.add({
          status: MODEL_STATUS.PENDING,
          name: 'test',
          action: 'test',
          data: {}
        });
        collection.at(0).save = function () {
          collection.at(0).set.apply(collection.at(0), arguments);
          return Promise.resolve();
        };
        expect(collection.length).to.equal(1);

        collection.processQueue().then(undefined, function () {
          expect(collection.length).to.equal(1);
          expect(apiStub.called).to.equal(true);
          done();
        });
      });
    });

    describe('Pending queue subsets', function () {
      var pendingCollection;

      var makePendingFormModel = function (idx) {
        var name = 'odd_forms';
        if (idx % 2 === 0) {
          name = 'even_forms';
        }

        return {
          _id: idx,
          name: name
        };
      };

      beforeEach(function () {
        // make the api stub be sucessfull
         /*eslint-disable new-cap */
        var deferred = $.Deferred();
        /* eslint-enable new-cap*/
        deferred.resolve();
        apiStub.returns(deferred);

        pendingCollection = new Collection([1, 2, 3, 4, 5, 6].map(makePendingFormModel));

        //make sure all items added correctly
        assert.equal(pendingCollection.length, 6);
      });

      afterEach(function () {
        pendingCollection = null;
        apiStub.reset();
      });

      it('should return a list of forms for a specific form name', function () {
        var evenItems = pendingCollection.getByFormName('even_forms');

        //make sure the length of the returned items is correct.
        assert.equal(evenItems.length, 3);

        //make sure we have all the even ones
        evenItems.forEach(function (pendingModel, index) {
          assert.equal(pendingModel.get('_id'), (index + 1) * 2);
        });
      });

      it('should process a subset of the pending queue and the status should be reflected in every pending collection the model is a part of', function () {
        var evenItems = pendingCollection.getByFormName('even_forms');
        return evenItems.processQueue().then(function () {
          //make sure the even items collection has an updated status
          evenItems.forEach(function (pendingModel) {
            assert.equal(pendingModel.get('status'), MODEL_STATUS.SUBMITTED);
          });

          //make sure that the even items are still referenced in the original pending collection
          evenItems.forEach(function (successfulPendingModel) {
            assert.isAbove(pendingCollection.indexOf(successfulPendingModel), -1);
          });
        });
      });

      it('should re-broadcast the "processed" event from the pending models from every collection they are a member of', function () {
        var evenItems = pendingCollection.getByFormName('even_forms');
        var expectedTimesCalled = evenItems.length * 2; // each submitted model is part of 2 pending collections.
        var actualTimesCalled = 0;

        var inc = function () {
          actualTimesCalled++;
        };

        evenItems.on('processed', inc);
        pendingCollection.on('processed', inc);

        return evenItems.processQueue().then(function () {
          assert.strictEqual(actualTimesCalled, expectedTimesCalled);
        });
      });

      it('should remove the successfully submitted pending model from all collections it is part of', function () {
        var evenItems = pendingCollection.getByFormName('even_forms');
        var originalCollectionLength = pendingCollection.length;
        evenItems.on('processed', function (model) {
          model.destroy();
        });

        return evenItems.processQueue().then(function () {
          //make sure we have less than we started with
          assert.isBelow(pendingCollection.length, originalCollectionLength);

          //make sure they are all the odd ones
          pendingCollection.forEach(function (model) {
            assert.equal(model.get('name'), 'odd_forms');
          });

          assert.strictEqual(evenItems.length, 0);
        });
      });
    });

    it('should retain draft items');
  });
});
