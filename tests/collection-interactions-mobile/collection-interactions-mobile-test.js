/*global chai:true, describe:true, it:true, before: true, beforeEach:true, after:true, afterEach:true, expect:true, should:true, sinon:true */
define('model-interaction-mobile', ['backbone'], function (Backbone) {
  "use strict";
  return Backbone.Model.extend();
});

define(['../../scripts/collection-interactions-mobile.js'],
  function (Collection) {
    "use strict";
    describe('Collection - Interactions', function () {
      it("should exist", function () {
        should.exist(Collection);
      });
    });
  });
