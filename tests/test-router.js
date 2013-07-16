/*global chai:true, describe:true, it:true, before: true, beforeEach:true, after:true, afterEach:true, expect:true, should:true, sinon:true */
// define('wrapper-backbone', [], function () {
//   "use strict";
//   return Backbone;
// });

// define('model-application-mobile', [], function () {
//   "use strict";
//   return Backbone.Model.extend();
// });

// define('model-interaction-mobile', [], function () {
//   "use strict";
//   return Backbone.Model.extend();
// });

// define('view-interaction-mobile', [], function () {
//   "use strict";
//   return Backbone.View.extend();
// });

// define('jquerymobile', [], function () {
//   "use strict";
//   console.log("Subtituting jQuery Mobile");
// });

define(function () {
  "use strict";
  describe('Router - jQuery Mobile Implementation', function () {
    var router, originalModel, originalView;

    before(function (done) {
      require(['model-application', 'view-interaction'], function (app, InteractionView) {

        originalModel = app;
        originalView = InteractionView;
        requirejs.undef('model-application');
        requirejs.undef('view-interaction');

        define('model-application', [], function () {
          return function (param) {console.log(param)};
        });

        define('view-interaction', [], function () {
          return function (param) {console.log(param)};
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

    it("should exist", function () {
      should.exist(router);
    });

    describe('initialize', function () {
      it("should contain the function initialize", function () {
        router.should.respondTo('initialize');
      });

      it("should bind to pagebeforeload");

      it("should prevent the default action");

      it("should detect if the interaction is specified by ID (instead of name)");

      it("should prepare the inheritance chain");

      it("should prepare any GET attributes");

      it("should tell the model to prepare for the view");

      it("should create the view");

      it("should bind view attribute creation to render event");

      it("should resolve the deferred on render event");

      it("should start the render process");
    });

    describe('inheritanceChain(data)', function () {
      it("should contain the function inheritanceChain", function () {
        router.should.respondTo('inheritanceChain');
      });

      it("should set the inheritance chain on relevant interactions");
    });
  });
});
