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

      describe("populate()", function () {
        it("should do nothing if offline");

        it("should get a form definition from the api");

        it("should save the form definition the the data store");
      });
    });
  });
