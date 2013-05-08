/*global chai:true, describe:true, it:true, before: true, beforeEach:true, after:true, afterEach:true, expect:true, should:true, sinon:true */
define('wrapper-backbone', ['backbone'], function (Backbone) {
  "use strict";
  return Backbone;
});

define('BlinkForms', [], function () {
  "use strict";
  return {};
});

define('model-form-mobile', ['backbone'], function (Backbone) {
  "use strict";
  return Backbone.Model.extend();
});

define(['../../scripts/collection-forms-mobile.js'],
  function (Collection) {
    "use strict";
    describe('Collection - Forms', function () {
      it("should exist", function () {
        should.exist(Collection);
      });
    });
  });
