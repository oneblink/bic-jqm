/*global chai:true, describe:true, it:true, before: true, beforeEach:true, after:true, afterEach:true, expect:true, should:true, sinon:true */
define('wrapper-backbone', ['backbone'], function (Backbone) {
  "use strict";
  return Backbone;
});

define('model-datasuitcase-mobile', ['backbone'], function (Backbone) {
  "use strict";
  return Backbone.Model.extend();
});

define(['../../scripts/collection-datasuitcases-mobile.js'],
  function (Collection) {
    "use strict";
    describe('Collection - DataSuitcases', function () {
      it("should exist", function () {
        should.exist(Collection);
      });
    });
  });
