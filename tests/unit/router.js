define([
  'Squire', 'sinon', 'jquery', 'jquerymobile', 'backbone'
], function (Squire, sinon, $, $mobile, Backbone) {
  'use strict';

  var CONTEXT = 'tests/unit/router.js';

  describe('Router - jQuery Mobile Implementation', function () {
    var injector, model, collection;

    before(function (done) {

      var cfg = JSON.parse(JSON.stringify(requirejs.s.contexts._.config));
      cfg.context = CONTEXT;
      require.config(cfg);
      injector = new Squire(CONTEXT);

      // import global `require('dep')` into local `injector.require('dep')`
      injector.mock('jquery', $);
      injector.mock('jquerymobile', $mobile);

      model = function (id) {
        return {
          id: id,
          prepareForView: sinon.stub().returns({
            then: function () { return null; }
          }),
          set: sinon.stub().returns({}),
          setArgsFromQueryString: function () { },
          getArgument: function () { },
          setArgument: function () { }
        };
      };

      collection = {};

      injector.mock('bic/model/application', {
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
        setArgsFromQueryString: function () { },
        getArgument: function () { },
        setArgument: function () { },
        forms: {
          download: function () { return null; }
        },
        currentInteraction: {
          get: function () {}
        }
      });
      injector.mock('bic/view/interaction', Backbone.View);
      injector.mock('bic/view/interaction/form', Backbone.View);
      done();

    });

    after(function () {
      injector.remove();
    });

    describe('suspendApplication', function () {
      var router;
      var app;

      beforeEach(function (done) {
        injector.require(['bic/router', 'bic/model/application'], function (r, a) {

          router = r;
          app = a;
          done();
        });
      });

      afterEach(function () {
        router = undefined;
        app = undefined;
      });

      it('should not throw an error', function () {

        var stub = sinon.stub(app.currentInteraction, 'get');
        stub.withArgs('type').returns('not a form');
        stub.withArgs('blinkFormAction').throws('Error');

        assert.doesNotThrow(router.suspendApplication);
        stub.restore();
      });

      it('should not throw an error', function () {

        var stub = sinon.stub(app.currentInteraction, 'get');
        stub.withArgs('type').returns('form');
        stub.withArgs('blinkFormAction').returns('not savable');
        stub.withArgs('args').throws('Error');

        assert.doesNotThrow(router.suspendApplication);
        stub.restore();
      });

      it('should throw an error', function () {

        var stub = sinon.stub(app.currentInteraction, 'get');
        stub.withArgs('type').returns('form');
        stub.withArgs('blinkFormAction').returns('add');
        stub.withArgs('args').throws('Error');

        assert.throws(router.suspendApplication);
        stub.restore();
      });
    });

    describe('resumeApplication', function () {
      var router;
      var changeMock;
      var expectation;
      var parseLocationStub;
      var testUrl = 'http://test';

      beforeEach(function (done) {
        injector.require(['bic/router'], function (r) {

          router = r;
          parseLocationStub = sinon.stub($.mobile.path, 'parseLocation');
          changeMock = sinon.mock($.mobile);
          expectation = changeMock.expects('changePage');

          done();
        });
      });

      afterEach(function () {
        router = undefined;
        expectation = undefined;
        localStorage.clear();
        parseLocationStub.restore();
        changeMock.restore();
        localStorage.removeItem('pauseURL');
      });

      it('should not call $.mobile.changePage', function () {
        localStorage.setItem('pauseURL', testUrl);
        parseLocationStub.returns({href: testUrl});
        expectation.never();

        router.resumeApplication();

        expectation.verify();

      });

      it('should not call $.mobile.changePage', function () {
        localStorage.removeItem('pauseURL');
        parseLocationStub.returns({href: testUrl});
        expectation.never();

        router.resumeApplication();

        expectation.verify();

      });

      it('should call $.mobile.changePage', function () {

        parseLocationStub.returns({href: testUrl + '1234'});
        localStorage.setItem('pauseURL', testUrl);
        expectation.once();

        router.resumeApplication();

        expectation.verify();

      });

    });
    // describe('routeRequest', function () {
    //   var router;

    //   beforeEach(function (done) {
    //     injector.require(['bic/router'], function (module) {
    //       router = module;
    //       done();
    //     });
    //   });

    //   afterEach(function () {

    //   });

    //   it('should ');

    //})

    describe('routeRequest(data)', function () {
      var router, testmodel;

      beforeEach(function (done) {
        injector.require(['bic/router'], function (module) {
          testmodel = model(1);
          sinon.stub(module, 'inheritanceChain', function () { return testmodel; });
         // sinon.stub(module, 'parseArgs', function () { return null; });
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
        //router.parseArgs.restore();
        testmodel.prepareForView.reset();
      });

      it('should call the inheritanceChain function to get the correct interaction model', function () {
        router.inheritanceChain.called.should.equal(true);
      });

      // it('should start the parseArgs function', function () {
      //   router.parseArgs.called.should.equal(true);
      // });

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
        injector.require(['bic/router'], function (module) {
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
