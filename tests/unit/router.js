define([
  'Squire', 'sinon', 'jquery', 'jquerymobile', 'backbone', 'chai'
], function (Squire, sinon, $, $mobile, Backbone, chai) {
  'use strict';

  var CONTEXT = 'tests/unit/router.js';

  var assert = chai.assert;
  chai.should();

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
            then: function () { return Promise.resolve(null); }
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
        get: function () { return null; },
        has: function () { return null; },
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

      injector.mock('bic/api', {
        getLoginStatus: function () { return null; }
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

    describe('router.constructor.Middleware', function () {
      var router, Middleware;

      beforeEach(function (done) {
        injector.require(['bic/router', 'bic/router/middleware'], function (r, mw) {
          router = r;
          Middleware = mw;
          done();
        });
      });

      it('is a Function', function () {
        assert.isFunction(router.constructor.Middleware);
      });

      it('is a reference to bic/router/middleware', function () {
        assert.strictEqual(router.constructor.Middleware, Middleware);
      });
    });

    describe('router.middleware', function () {
      var router, Middleware;

      beforeEach(function (done) {
        injector.require(['bic/router', 'bic/router/middleware'], function (r, mw) {
          router = r;
          Middleware = mw;
          done();
        });
      });

      it('is an instance of bic/router/middleware', function () {
        assert.instanceOf(router.middleware, Middleware);
      });
    });

    describe('bic/router/middleware/app', function () {
      var middleware;

      beforeEach(function (done) {
        injector.require(['bic/router/middleware/app'], function (mw) {
          middleware = mw;
          done();
        });
      });

      it('exports a Function, with 3 arguments', function () {
        assert.isFunction(middleware);
        assert.lengthOf(middleware, 3);
      });

      it('eventually calls next()', function (done) {
        middleware({}, {}, function () {
          done();
        });
      });
    });

    describe('bic/router/middleware/errorHandler', function () {
      var middleware;

      beforeEach(function (done) {
        injector.require(['bic/router/middleware/errorHandler'], function (mw) {
          middleware = mw;
          done();
        });
      });

      it('exports a Function, with 3 arguments', function () {
        assert.isFunction(middleware);
        assert.lengthOf(middleware, 3);
      });
    });

    describe('bic/router/middleware/model', function () {
      var middleware;

      beforeEach(function (done) {
        injector.require(['bic/router/middleware/model'], function (mw) {
          middleware = mw;
          done();
        });
      });

      it('exports a Function, with 3 arguments', function () {
        assert.isFunction(middleware);
        assert.lengthOf(middleware, 3);
      });

      it('eventually calls next()', function (done) {
        var mockModel = new Backbone.Model();
        mockModel.setArgsFromQueryString = function () {};
        mockModel.prepareForView = function () { return Promise.resolve(); };
        middleware({}, {
          app: {
            router: {
              inheritanceChain: function () {
                return mockModel;
              }
            }
          },
          path: $mobile.path.parseUrl(location.href)
        }, function () {
          done();
        });
      });
    });

    describe('bic/router/middleware/path', function () {
      var middleware;

      beforeEach(function (done) {
        injector.require(['bic/router/middleware/path'], function (mw) {
          middleware = mw;
          done();
        });
      });

      it('exports a Function, with 3 arguments', function () {
        assert.isFunction(middleware);
        assert.lengthOf(middleware, 3);
      });

      it('eventually calls next()', function (done) {
        middleware({}, {}, function () {
          done();
        });
      });
    });

    describe('bic/router/middleware/bootStatus', function () {
      var middleware;
      var bootStatusSpy;

      beforeEach(function (done) {
        injector.require(['bic/router/middleware/bootStatus'], function (mw) {
          middleware = mw;
          done();
        });
      });

      it('exports a Function, with 3 arguments', function () {
        assert.isFunction(middleware);
        assert.lengthOf(middleware, 3);
      });

      it('eventually calls next()', function (done) {
        window.BootStatus = {
          notifySuccess: function () {}
        };
        bootStatusSpy = sinon.spy(window.BootStatus, 'notifySuccess');
        middleware({
          deferred: new $.Deferred()
        }, {
          view: new Backbone.View()
        }, function () {
          middleware({
            deferred: new $.Deferred()
          }, {
            view: new Backbone.View()
          }, function () {
            assert.ok(bootStatusSpy.callCount, 1);
            done();
          });
        });
      });
    });

    describe('bic/router/middleware/resolve', function () {
      var middleware;

      beforeEach(function (done) {
        injector.require(['bic/router/middleware/resolve'], function (mw) {
          middleware = mw;
          done();
        });
      });

      it('exports a Function, with 3 arguments', function () {
        assert.isFunction(middleware);
        assert.lengthOf(middleware, 3);
      });

      it('eventually calls next()', function (done) {
        middleware({
          deferred: new $.Deferred()
        }, {
          view: new Backbone.View()
        }, function () {
          done();
        });
      });
    });

    describe('bic/router/middleware/login', function () {
      var middleware;
      var appModel;
      var api;

      beforeEach(function (done) {
        injector.require(['bic/router/middleware/login', 'bic/model/application', 'bic/api'], function (mw, a, ap) {
          middleware = mw;
          appModel = a;
          api = ap;
          done();
        });
      });

      afterEach(function () {
        middleware = undefined;
        appModel = undefined;
        api = undefined;
      });

      it('exports a Function, with 3 arguments', function () {
        assert.isFunction(middleware);
        assert.lengthOf(middleware, 3);
      });

      it('eventually calls next() when loginAccess set undefined', function (done) {
        var data = {app: appModel};
        var stubHas = sinon.stub(appModel, 'has');

        stubHas.withArgs('loginAccess').returns(undefined);
          middleware({}, data, function () {
            stubHas.restore();
            done();
          });
      });

      it('eventually calls next() when loginAccess set true and user in LOGGED IN', function (done) {
        var loginData = {status: 'LOGGED IN'};
        var data = { app: appModel };
        var stubAPI = sinon.stub(api, 'getLoginStatus', function () {
          var d = new $.Deferred();
          d.resolve(loginData);
          return d;
        });
        var stub = sinon.stub(appModel, 'get');
        var stubHas = sinon.stub(appModel, 'has');

        stub.withArgs('loginAccess').returns(true);
        stub.withArgs('loginPromptInteraction').returns(8124);
        stubHas.withArgs('loginAccess').returns(true);
        stubHas.withArgs('loginPromptInteraction').returns(true);
        middleware({}, data, function () {
          stubAPI.restore();
          stub.restore();
          stubHas.restore();
          done();
        });
      });
    });

    describe('bic/router/middleware/view', function () {
      var middleware;

      beforeEach(function (done) {
        injector.require(['bic/router/middleware/view'], function (mw) {
          middleware = mw;
          done();
        });
      });

      it('exports a Function, with 3 arguments', function () {
        assert.isFunction(middleware);
        assert.lengthOf(middleware, 3);
      });

      it('eventually calls next()', function (done) {
        middleware({}, {
          model: new Backbone.Model()
        }, function () {
          done();
        });
      });
    });

    describe('bic/router/middleware/viewRender', function () {
      var middleware;

      beforeEach(function (done) {
        injector.require(['bic/router/middleware/viewRender'], function (mw) {
          middleware = mw;
          done();
        });
      });

      it('exports a Function, with 3 arguments', function () {
        assert.isFunction(middleware);
        assert.lengthOf(middleware, 3);
      });

      it('eventually calls next()', function (done) {
        var mockView = new Backbone.View();
        mockView.render = function () {
          setTimeout(function () {
            this.trigger('render');
          }.bind(this), 0);
        };
        middleware({}, {
          view: mockView
        }, function () {
          done();
        });
      });
    });

    describe('bic/router/middleware/whenPopulated', function () {
      var middleware;

      beforeEach(function (done) {
        injector.require(['bic/router/middleware/whenPopulated'], function (mw) {
          middleware = mw;
          done();
        });
      });

      it('exports a Function, with 3 arguments', function () {
        assert.isFunction(middleware);
        assert.lengthOf(middleware, 3);
      });

      it('eventually calls next()', function (done) {
        middleware({}, {
          app: {
            whenPopulated: function () { return Promise.resolve(); }
          }
        }, function () {
          done();
        });
      });
    });
  });
});
