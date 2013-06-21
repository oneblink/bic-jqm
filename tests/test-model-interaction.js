/*global chai:true, describe:true, it:true, before: true, beforeEach:true, after:true, afterEach:true, expect:true, should:true, sinon:true */
define('wrapper-backbone', [], function () {
  "use strict";
  return Backbone;
});

define('jquerymobile', [], function () {
  "use strict";
  console.log("Subtituting jQuery Mobile");
});

define('api-php', ['../../scripts/api-php'], function (API) {
  "use strict";
  var stub = sinon.stub(API);
  return stub;
});

define(function () {
    "use strict";
    describe('Model - Interaction', function () {
      var Model;

      before(function (done) {
        require(['model-interaction'], function (rModel) {
          Model = rModel;
          done();
        });
      });

      it("should exist", function () {
        should.exist(Model);
      });

      it("should be a constructor function", function () {
        Model.should.be.an.instanceOf(Function);
      });

      describe('inherit(config)', function () {
        it("should set the parent of this item for the inheritance chain");
      });

      describe('performXSLT()', function () {
        it("should substitute $args[] in the XSL template");

        it("should substitute blink-stars statements in the XSL template");

        it("should do the transformation and save the result to the model as content");

        it("should throw appropriate errors if the data is malformed");
      });

      describe('prepareView(data)', function () {
        it("should detect if you are on the home screen and load in homeInteraction");

        it("should detect if you are on the home screen and generate a list of items");

        it("should detect if you are on a MADL interaction and fetch result from server");

        it("should save the MADL result for offline access");

        it("should detect if you are on a Stars XSLT interaction and prepare the XML");

        it("should return a promise");
      });
    });
  });
