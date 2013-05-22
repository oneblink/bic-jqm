/*global chai:true, describe:true, it:true, before: true, beforeEach:true, after:true, afterEach:true, expect:true, should:true, sinon:true */
define('wrapper-backbone', ['backbone'], function (Backbone) {
  "use strict";
  return Backbone;
});

define('model-application-mobile', ['backbone'], function (Backbone) {
  "use strict";
  return Backbone.Model.extend();
});

define('model-interaction-mobile', ['backbone'], function (Backbone) {
  "use strict";
  return Backbone.Model.extend();
});

define('view-interaction-mobile', ['backbone'], function (Backbone) {
  "use strict";
  return Backbone.View.extend();
});

define('jquerymobile', [], function () {
  "use strict";
  console.log("Subtituting jQuery Mobile");
});

define(['../../scripts/router-mobile.js'],
  function (router) {
    "use strict";
    describe('Router - jQuery Mobile Implementation', function () {
      it("should exist", function () {
        should.exist(router);
      });

      describe('initialize', function () {
        it("should contain the function initialize", function () {
          router.should.respondTo('initialize');
        });
      });

      describe('inheritanceChain', function () {
        it("should contain the function inheritanceChain", function () {
          router.should.respondTo('inheritanceChain');
        });
      });
    });
  });
