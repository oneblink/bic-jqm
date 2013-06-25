/*global chai:true, describe:true, it:true, before: true, beforeEach:true, after:true, afterEach:true, expect:true, should:true, sinon:true */
// define('wrapper-backbone', [], function () {
//   "use strict";
//   return Backbone;
// });

// define('model-application-mobile', [], function () {
//   "use strict";
//   return Backbone.Model.extend();
// });

// define('jquerymobile', [], function () {
//   "use strict";
//   console.log("Subtituting jQuery Mobile");
// });

// define('BlinkForms', [], function () {
//   "use strict";
//   return {};
// });

// define('api-php', ['../../scripts/api-php'], function (API) {
//   "use strict";
//   var stub = sinon.stub(API);
//   return stub;
// });

define(function () {
  "use strict";
  describe('Model - Form', function () {
    var Model, originalAPI;

    before(function (done) {
      require(['api'], function (API) {

        originalAPI = API;
        requirejs.undef('api');

        define('api', [], function () {
          return function (param) {console.log(param)};
        });
        
        require(['model-form'], function (rModel) {
          Model = rModel;
          done();
        });
      });
    });

    after(function () {
      requirejs.undef('api');
      define('api', [], function () {return originalAPI; });
    });

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
