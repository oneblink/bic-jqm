/*global chai:true, describe:true, it:true, before: true, beforeEach:true, after:true, afterEach:true, expect:true, should:true, sinon:true */
define('wrapper-backbone', ['backbone'], function (Backbone) {
  "use strict";
  return Backbone;
});

define('model-pending-mobile', ['backbone'], function (Backbone) {
  "use strict";
  return Backbone.Model.extend();
});

define('data-pouch', [], function () {
  "use strict";
  return function () {};
});

define('api-php', ['../../scripts/api-php'], function (API) {
  "use strict";
  var stub = sinon.stub(API);
  return stub;
});

define(['../../scripts/collection-pending.js'],
  function (Collection) {
    "use strict";
    describe('Collection - Pending', function () {
      it("should exist", function () {
        should.exist(Collection);
      });
    });
  });
