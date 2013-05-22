/*global chai:true, describe:true, it:true, before: true, beforeEach:true, after:true, afterEach:true, expect:true, should:true, sinon:true */
define('wrapper-backbone', ['backbone'], function (Backbone) {
  "use strict";
  return Backbone;
});

define('model-star-mobile', ['backbone'], function (Backbone) {
  "use strict";
  return Backbone.Model.extend();
});

define('data-pouch', [], function () {
  "use strict";
  return function () {};
});


define(['../../scripts/collection-stars-mobile.js'],
  function (Collection) {
    "use strict";
    describe('Collection - Interactions', function () {
      it("should exist", function () {
        should.exist(Collection);
      });
    });
  });
