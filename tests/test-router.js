/*global chai:true, describe:true, it:true, before: true, beforeEach:true, after:true, afterEach:true, expect:true, should:true, sinon:true */
define(function () {
  "use strict";
  describe('Router - jQuery Mobile Implementation', function () {
    var context,
      stubs,
      model,
      collection;

      model = function (id) {
        return {
          id: id,
          prepareForView: sinon.stub().returns({
            then: function () {return {}}
          }),
          set: sinon.stub().returns({})
        }
      }

      collection = {};

      stubs = {
        'model-application': {
          set: function () {return {}},
          interactions: {
            get: function (id) {
              if (!collection[id]) {
                collection[id] = model(id);
              }
              return collection[id];
            },
            set: function () {return {}}
          }
        },
        'view-interaction': {
          render: function () {return {}}
        }
      };

      context = createContext(stubs);

    // THIS HAS BEEN MOVED TO MODEL-APPLICATION!!!
    describe('initialize()', function () {
      //it("should create binding to pagebeforeload that passes the event data object to routeRequest", function () {
        //context(['router'], function (router) {
          //sinon.stub(router, "routeRequest");
          //$(document).trigger('pagebeforeload', {});
          //router.routeRequest.called.should.be.true;
          //router.routeRequest.calledWith({}).should.be.true;
          //router.routeRequest.restore();
        //});
      //});
    });

    describe('routeRequest(data)', function () {
      var router, testmodel;

      beforeEach(function (done) {
        context(['router'], function (module) {
          testmodel = model(1);
          sinon.stub(module, "inheritanceChain", function () {return testmodel});
          sinon.stub(module, "parseArgs", function () {return {}});
          router = module;
          router.routeRequest({
            dataUrl: "/test",
            deferred: new $.Deferred()
          });
          done();
        });
      });

      afterEach(function () {
        router.inheritanceChain.restore();
        router.parseArgs.restore();
        testmodel.prepareForView.reset();
      });


      it("should call the inheritanceChain function to get the correct interaction model", function () {
        router.inheritanceChain.called.should.be.true;
      });

      it("should start the parseArgs function", function () {
        router.parseArgs.called.should.be.true;
      });

      it("should instruct the model to prepareForView", function () {
        router.inheritanceChain.called.should.be.true;
        testmodel.prepareForView.called.should.be.true;
      });

      //it("should create a new view", function () {
        //context(['view-interaction'], function (view) {
          //view.render.should.be.true;
          //view.reset();
        //});
      //});

      //it("should resolve the event deferred (transitioning the view onscreen)", function (done) {
        //dfrd.always(function () {
          //done();
        //});
      //});

      //it("should remove old views from the DOM");
    });

    describe('inheritanceChain(urlString)', function () {
      var router;

      beforeEach(function (done) {
        context(['router'], function (module) {
          router = module;
          done();
        });
      });

      afterEach(function () {});

      it("should parse the path given to find the current interaction", function () {
        var data = "/councils/traffic";
        router.inheritanceChain(data).id.should.equal('traffic');
      });

      //it("should detect interactions specified by ID (instead of name)");

      it("should use the path to determine the inheritance chain", function () {
        var data = "/councils/traffic";
        var model = router.inheritanceChain(data);
        model.set.called.should.be.true;
        model.set.calledWith({parent: 'councils'}).should.be.true;
      });

      //it("should set the parent of each interaction in the chain on the associated model", function () {
        //var interaction = router.inheritanceChain("/test/second");
        //interaction.get('parent').should.be.string(interactionSetSpy.secondCall.args[0].parent);
      //});

      //it("should set the topmost interaction in the chain to have a parent of the answerspace", function () {
        //router.inheritanceChain("/test").get('parent').should.be.string("app");
      //});

      //it("should return the correct interaction to attach the view to", function () {
        //router.inheritanceChain("/test").should.be.instanceOf(Backbone.Model);
      //});

      it("should handle the same interaction being listed twice (last winning out)", function () {
        var data = "/councils/traffic/trafficcams/traffic";
        router.inheritanceChain(data).id.should.equal('traffic');
      });
    });

    //describe('parseArgs(argsString, model)', function () {
      //it("should identify any GET arguments in the input string");
      //it("should parse found arguments into an object");
      //it("should set the object on the model as 'args'");
    //});
  });
});
