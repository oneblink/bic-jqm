define(['Squire'], function (Squire) {
  'use strict';
  describe('Router - jQuery Mobile Implementation', function () {
    var injector, model, collection;

    before(function (done) {

      model = function (id) {
        return {
          id: id,
          prepareForView: sinon.stub().returns({
            then: function () { return null; }
          }),
          set: sinon.stub().returns({})
        };
      };

      collection = {};

      injector = new Squire();
      injector.mock('model-application', {
        set: function () { return null; },
        interactions: {
          get: function (id) {
            if (!collection[id]) {
              collection[id] = model(id);
            }
            return collection[id];
          },
          set: function () { return null; }
        },
        datastore: function () { return this; },
        collections: function () { return Promise.resolve(); },
        whenPopulated: function () { return Promise.resolve(); },
        setup: function () { return Promise.resolve(); },
        populate: function () { return Promise.resolve(); },
        initialRender: function () { return null; },
        forms: {
          download: function () { return null; }
        }
      });
      injector.mock('view-interaction', {
        render: function () { return null; }
      });
      done();

    });

    describe('routeRequest(data)', function () {
      var router, testmodel;

      beforeEach(function (done) {
        injector.require(['../src/router'], function (module) {
          testmodel = model(1);
          sinon.stub(module, 'inheritanceChain', function () { return testmodel; });
          sinon.stub(module, 'parseArgs', function () { return null; });
          router = module;
          router.routeRequest({
            dataUrl: '/test',
            deferred: Promise.resolve()
          });
          setTimeout(done, 1e3);
        });
      });

      afterEach(function () {
        router.inheritanceChain.restore();
        router.parseArgs.restore();
        testmodel.prepareForView.reset();
      });


      it('should call the inheritanceChain function to get the correct interaction model', function () {
        router.inheritanceChain.called.should.equal(true);
      });

      it('should start the parseArgs function', function () {
        router.parseArgs.called.should.equal(true);
      });

      it('should instruct the model to prepareForView', function () {
        router.inheritanceChain.called.should.equal(true);
        testmodel.prepareForView.called.should.equal(true);
      });

      //it('should create a new view', function () {
        //context(['view-interaction'], function (view) {
          //view.render.should.be.true;
          //view.reset();
        //});
      //});

      //it('should resolve the event deferred (transitioning the view onscreen)', function (done) {
        //dfrd.always(function () {
          //done();
        //});
      //});

      //it('should remove old views from the DOM');
    });

    describe('inheritanceChain(parsedUrl)', function () {
      var router;

      beforeEach(function (done) {
        injector.require(['../src/router'], function (module) {
          router = module;
          done();
        });
      });

      it('should parse the path given to find the current interaction', function () {
        var data = '/councils/traffic';
        data = $.mobile.path.parseUrl(data);
        router.inheritanceChain(data).id.should.equal('traffic');
      });

      //it('should detect interactions specified by ID (instead of name)');

      it('should use the path to determine the inheritance chain', function () {
        var data, chainedModel;
        data = '/councils/traffic';
        data = $.mobile.path.parseUrl(data);
        chainedModel = router.inheritanceChain(data);
        chainedModel.set.called.should.equal(true);
        chainedModel.set.calledWith({parent: 'councils'}).should.equal(true);
      });

      //it('should set the parent of each interaction in the chain on the associated model', function () {
        //var interaction = router.inheritanceChain('/test/second');
        //interaction.get('parent').should.be.string(interactionSetSpy.secondCall.args[0].parent);
      //});

      //it('should set the topmost interaction in the chain to have a parent of the answerspace', function () {
        //router.inheritanceChain('/test').get('parent').should.be.string('app');
      //});

      //it('should return the correct interaction to attach the view to', function () {
        //router.inheritanceChain('/test').should.be.instanceOf(Backbone.Model);
      //});

      it('should handle the same interaction being listed twice (last winning out)', function () {
        var data = '/councils/traffic/trafficcams/traffic';
        data = $.mobile.path.parseUrl(data);
        router.inheritanceChain(data).id.should.equal('traffic');
      });

      it('should drop blank trailing values from the array', function () {
        var data = '/councils/traffic/';
        data = $.mobile.path.parseUrl(data);
        router.inheritanceChain(data).id.should.equal('traffic');
      });
    });

    //describe('parseArgs(argsString, model)', function () {
      //it('should identify any GET arguments in the input string');
      //it('should parse found arguments into an object');
      //it('should set the object on the model as 'args'');
    //});
  });
});
