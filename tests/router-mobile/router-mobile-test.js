/*global chai:true, describe:true, it:true, before: true, beforeEach:true, after:true, afterEach:true, expect:true, should:true, sinon:true */
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

define('collection-interactions-mobile', ['backbone'], function (Backbone) {
  "use strict";
  return Backbone.Collection.extend();
});

define('jquerymobile', [], function () {
  "use strict";
  console.log("Subtituting jQuery Mobile");
});

//Backbone, app, InteractionModel, InteractionView, $
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

      describe('processPath', function () {
        it("should contain the function processPath", function () {
          router.should.respondTo('processPath');
        });
      });

      describe('assembleArgs', function () {
        it("should contain the function assembleArgs", function () {
          router.should.respondTo('assembleArgs');
        });
      });

      describe('loadInteraction', function () {
        it("should contain the function loadInteraction", function () {
          router.should.respondTo('loadInteraction');
        });
      });

      describe('displayInteraction', function () {
        it("should contain the function displayInteraction", function () {
          router.should.respondTo('displayInteraction');
        });
      });
    });
  });
