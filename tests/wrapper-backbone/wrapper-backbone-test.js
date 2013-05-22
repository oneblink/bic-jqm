/*global chai:true, describe:true, it:true, before: true, beforeEach:true, after:true, afterEach:true, expect:true, should:true, sinon:true */
define('wrapper-backbone', ['backbone'], function (Backbone) {
  "use strict";
  return Backbone;
});

define('data-pouch', [], function () {
  "use strict";
  return function () {};
});

define(['../../scripts/wrapper-backbone.js', 'backbone', 'jquery'],
  function (View, Backbone, $) {
    "use strict";
    describe('Wrapper - Backbone', function () {
      
      it("should exist", function () {
        should.exist(View);
      });

      it("should overwrite Backbone.sync to dynamically choose the correct sync method");

      it("should have a function to choose the correct sync method");

      it("should provide sync with the bindings to the data abstraction layer");

      it("should return Backbone");
    });
  });
