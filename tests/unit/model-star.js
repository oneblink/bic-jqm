define(['Squire', 'backbone'], function (Squire, Backbone) {
  'use strict';
  describe('Model - Star', function () {
    var injector, Model;

    before(function (done) {
      injector = new Squire();

      injector.mock('bic/model-application', Backbone.Model.extend({
      }));

      injector.require(['bic/model-star'], function (rModel) {
        Model = rModel;
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

    describe('initialize()', function () {
      it('should listen for add events to trigger a model.save()');
      //   , function (done) {
      //   require(['wrapper-backbone'], function (Backbone) {
      //     var model = new Model({_id: 'TestID'});
      //     Backbone.sync.reset();
      //     model.trigger('add');
      //     Backbone.sync.called.should.be.true;
      //     done();
      //   });
      // });
    });

    describe('toggle()', function () {
      it('should invert the boolean "state" false to true');
      //it('should invert the boolean 'state' false to true', function (done) {
        //var model;
        //model = new Model({state: false});
        //model.on('change', function () {
          //model.get('state').should.be.true;
          //done();
        //});
        //model.toggle();
      //});

      it('should invert the boolean "state" true to false');
      //it('should invert the boolean 'state' true to false', function (done) {
        //var model;
        //model = new Model({state: true});
        //model.on('change', function () {
          //model.get('state').should.be.false;
          //done();
        //});
        //model.toggle();
      //});

      it('should add itself to the stars collection when state changed to true');
      //it('should add itself to the stars collection when state changed to true', function (done) {
        //var model = new Model({state: false});
        //model.on('add', function () {
          //done();
        //});
        //model.toggle();
      //});

      it('should destroy itself when state changed to false');
      //it('should destroy itself when state changed to false', function (done) {
        //injector.require(['model-application'], function (app) {
          //var model = new Model({state: true});
          //model.on('destroy', function () {
            //done();
          //})
          //model.toggle();
        //});
      //});
    });
  });
});
