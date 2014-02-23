/*global chai:true, describe:true, it:true, before: true, beforeEach:true, after:true, afterEach:true, expect:true, should:true, sinon:true */
define(function () {
  "use strict";
  describe('Router - jQuery Mobile Implementation', function () {
    var router, originalModel, originalView, viewSpy, interactionsGetStub, interactionSetSpy;

    before(function (done) {
      require(['model-application', 'view-interaction'], function (app, InteractionView) {
        var interactionModel;

        originalModel = app;
        originalView = InteractionView;
        requirejs.undef('model-application');
        requirejs.undef('view-interaction');

        app = new Backbone.Model();
        app.interactions = new Backbone.Collection();
        interactionsGetStub = sinon.stub(app.interactions, "get");

        interactionModel = new Backbone.Model();
        interactionModel.set({'id': function () {return "twelve"}()})
        interactionSetSpy = sinon.spy(interactionModel, "set");
        app.interactions.get.returns(interactionModel);

        define('model-application', [], function () {
          return app;
        });

        var view = Backbone.View.extend({
          render: function () {
            this.trigger('render');
          }
        });
        viewSpy = sinon.spy(view);
        define('view-interaction', [], function () {
          return viewSpy;
        });

        require(['router'], function (rRouter) {
          router = rRouter;
          done();
        });
      });
    });

    after(function () {
      requirejs.undef('model-application');
      requirejs.undef('view-interaction');
      define('model-application', [], function () {
          return originalModel;
        });

        define('view-interaction', [], function () {
          return originalView;
        });
    });

    describe('initialize()', function () {
      it("should create binding to pagebeforeload that passes the event data object to routeRequest", function () {
        sinon.stub(router, "routeRequest");
        $(document).trigger('pagebeforeload', {});
        router.routeRequest.called.should.be.true;
        router.routeRequest.calledWith({}).should.be.true;
        router.routeRequest.restore();
      });
    });

    describe('routeRequest(data)', function () {
      var model, dfrd;

      before(function () {
        var stub;
        stub = sinon.stub(router, "inheritanceChain");
        sinon.stub(router, "parseArgs");
        model = new Backbone.Model;
        model.prepareForView = function () {
          return $.Deferred().resolve(this).promise();
        };
        sinon.spy(model, "prepareForView");
        stub.returns(model);

        //This is slightly cheating, but saves me doing it over and over again
        dfrd = new $.Deferred();
        router.routeRequest({
          dataUrl: "/test",
          deferred: dfrd
        });

      });

      after(function () {
        router.inheritanceChain.restore();
        router.parseArgs.restore();
      });

      it("should call the inheritanceChain function to get the correct interaction model", function () {
        router.inheritanceChain.called.should.be.true;
        router.inheritanceChain.reset();
      });

      it("should start the parseArgs function", function () {
        router.parseArgs.called.should.be.true;
        router.parseArgs.reset();
      });

      it("should instruct the model to prepareForView", function () {
        model.prepareForView.called.should.be.true;
        model.prepareForView.reset();
      });

      it("should create a new view", function () {
        viewSpy.called.should.be.true;
        viewSpy.reset();
      });

      it("should resolve the event deferred (transitioning the view onscreen)", function (done) {
        dfrd.always(function () {
          done();
        });
      });

      it("should remove old views from the DOM");
    });

    describe('inheritanceChain(urlString)', function () {
      it("should parse the path given for interactions");
      it("should detect interactions specified by ID (instead of name)");
      it("should use the path to determine the inheritance chain");

      it("should set the parent of each interaction in the chain on the associated model", function () {
        var interaction = router.inheritanceChain("/test/second");
        interaction.get('parent').should.be.string(interactionSetSpy.secondCall.args[0].parent);
      });

      it("should set the topmost interaction in the chain to have a parent of the answerspace", function () {
        router.inheritanceChain("/test").get('parent').should.be.string("app");
      });

      it("should return the correct interaction to attach the view to", function () {
        router.inheritanceChain("/test").should.be.instanceOf(Backbone.Model);
      });
    });

    describe('parseArgs(argsString, model)', function () {
      it("should identify any GET arguments in the input string");
      it("should parse found arguments into an object");
      it("should set the object on the model as 'args'");
    });
  });
});
