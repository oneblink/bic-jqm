/*global chai:true, describe:true, it:true, before: true, beforeEach:true, after:true, afterEach:true, expect:true, should:true, sinon:true */
define('wrapper-backbone', ['backbone'], function (Backbone) {
  "use strict";
  return Backbone;
});

define('model-application-mobile', ['backbone'], function (Backbone) {
  "use strict";
  return Backbone.Model.extend();
});

define('jquerymobile', [], function () {
  "use strict";
  console.log("Subtituting jQuery Mobile");
});

define('BlinkForms', [], function () {
  "use strict";
  return {};
});

define('api-php', ['../../scripts/api-php'], function (API) {
  "use strict";
  var stub = sinon.stub(API);
  return stub;
});

define(['../../scripts/model-form-mobile.js'],
  function (Model) {
    "use strict";
    describe('Model - Form', function () {
      it("should exist", function () {
        should.exist(Model);
      });

      // it("should be a constructor function", function () {
      //   Model.should.be.an.instanceOf(Function);
      // });
    });
  });
