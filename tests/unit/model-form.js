define(['Squire', 'underscore', 'chai'], function (Squire, _, chai) {
  'use strict';

  var should = chai.should();

  describe('Model - Form', function () {
    var injector, Model;

    before(function (done) {
      injector = new Squire();

      injector.mock('bic/api', function () { return null; });

      injector.require(['bic/model/form'], function (required) {
        Model = required;
        done();
      });
    });

    it('should exist', function () {
      should.exist(Model);
    });

    describe('populate()', function () {
      it('should do nothing if offline');

      it('should get a form definition from the api');

      it('should save the form definition the the data store');
    });

    describe('setActionDestination', function () {
      var formModel;
      var origActions;
      var newActions;

      beforeEach(function (done) {
        injector.require(['bic/model/form'], function (FormModel) {
          formModel = new FormModel();

          origActions = {
            add: function () {
              return 'add-orig';
            }
          };

          newActions = {
            add: function () {
              return 'add-new';
            },
            list: function () {
              return 'list-new';
            }
          };

          done();
        });
      });

      afterEach(function () {
        formModel = null;
        origActions = null;
        newActions = null;
      });

      it('should set the "onFormLeaveInteraction" attribute', function () {
        var mergedActions;

        formModel.setActionDestination(origActions);
        assert.deepEqual(formModel.get('onFormLeaveInteraction'), origActions);

        formModel.setActionDestination(newActions);
        assert.deepEqual(formModel.get('onFormLeaveInteraction'), newActions);

        mergedActions = _.extend({}, newActions, {run: 'blah'});
        formModel.setActionDestination({run: 'blah'});
        assert.equal(formModel.get('onFormLeaveInteraction').run, 'blah');
        assert.deepEqual(formModel.get('onFormLeaveInteraction'), mergedActions);
      });
    });
  });
});
