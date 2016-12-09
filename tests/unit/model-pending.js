define(['Squire', 'chai', 'jquery', 'backbone', 'bic/enum-model-status'], function (Squire, chai, $, Backbone, MODEL_STATUS) {
  'use strict';

  var CONTEXT = 'tests/unit/model-pending.js';
  var should = chai.should();

  describe('Model - Pending', function () {
    var injector, Model, apiStub;

    before(function (done) {
      var cfg = JSON.parse(JSON.stringify(requirejs.s.contexts._.config));
      cfg.context = CONTEXT;
      require.config(cfg);
      injector = new Squire(CONTEXT);

      injector.mock('backbone', Backbone);
      injector.mock('BlinkForms', {
        errorHelpers: {
          fromBMP: function () {
            return 1;
          }
        }
      });

      apiStub = sinon.stub();

      injector.mock('bic/api', {
        setPendingItem: apiStub
      });

      injector.require(['bic/model/pending'], function (required) {
        Model = required;
        done();
      });
    });

    it('should exist', function () {
      should.exist(Model);
    });

    it('should be a constructor function', function () {
      Model.should.be.an.instanceOf(Function);
    });

    describe('idAttribute', function () {
      it('should be set to _id', function () {
        var model = new Model({_id: 'TestID'});
        model.idAttribute.should.be.string('_id');
      });

      it('should be picked up by the model', function () {
        var model = new Model({_id: 'TestID'});
        model.id.should.be.string('TestID');
      });
    });

    describe('#process', function () {
      var model, oldSave;

      beforeEach(function () {
        oldSave = Backbone.Model.prototype.save;

        Backbone.Model.prototype.save = function () {
          return Promise.resolve();
        };

        model = new Model({
          key: 'value'
        });
      });

      afterEach(function () {
        apiStub.reset();
        model = null;

        Backbone.Model.prototype.save = oldSave;
      });

      it('should resolve the promise on success', function (done) {
        /* eslint-disable new-cap */
        var deferred = $.Deferred();
        /* eslint-enable new-cap */
        deferred.resolve();
        apiStub.returns(deferred);

        model.process().then(function () {
          done();
        });
      });

      it('should reject the promise on fail', function (done) {
         /* eslint-disable new-cap */
        var deferred = $.Deferred();
        /* eslint-enable new-cap */
        deferred.reject();
        apiStub.returns(deferred);

        model.process()
              .then(function () {
                assert.fail(arguments, 'This should not be hit');
              })
              .then(undefined, function () {
                done();
              });
      });

      it('should trigger the "processed" event with itself as an argument, on successful submission', function (done) {
        /* eslint-disable new-cap */
        var deferred = $.Deferred();
        /* eslint-enable new-cap */
        deferred.resolve();
        apiStub.returns(deferred);

        model.on('processed', function (suppliedModel) {
          assert.strictEqual(suppliedModel, model);
          done();
        });

        model.process().catch(done);
      });

      it('should NOT trigger the "processed" event, on unsuccessful submission', function (done) {
        /* eslint-disable new-cap */
        var deferred = $.Deferred();
        /* eslint-enable new-cap */
        deferred.reject();
        apiStub.returns(deferred);

        model.on('processed', function () {
          assert.fail('processed', '"processed" event should never have run');
          done('"processed" event should never have run');
        });

        model.process().catch(function () {
          done();
        });
      });

      it('should update a model status if there is a server error', function (done) {
        /* eslint-disable new-cap */
        var deferred = $.Deferred();
        /* eslint-enable new-cap */
        deferred.reject({responseText: JSON.stringify({message: 'the server error'})}, 'error');
        apiStub.returns(deferred);

        model.process()
              .then(function () {
                assert.fail('processed', 'should not reach this bit of code');
              })
              .catch(function () {
                assert.equal(model.get('status'), MODEL_STATUS.FAILED_VALIDATION);
                done();
              });
      });
    });
  });
});
