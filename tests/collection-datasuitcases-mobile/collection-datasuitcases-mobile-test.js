/*global chai:true, describe:true, it:true, before: true, beforeEach:true, after:true, afterEach:true, expect:true, should:true, sinon:true */
define('wrapper-backbone', ['backbone'], function (Backbone) {
  "use strict";
  Backbone.sync = function () {};
  return Backbone;
});

define('model-datasuitcase-mobile', ['backbone'], function (Backbone) {
  "use strict";
  return Backbone.Model.extend();
});

define('data-pouch', [], function () {
  "use strict";
  return function () {};
});

window.BMP = {
  siteVars: {
    answerSpace: 'Exists',
    answerSpaceId: 1
  }
};

define(['../../scripts/collection-datasuitcases-mobile.js', 'jquery'],
  function (Collection, $) {
    "use strict";
    var collection;

    describe('Collection - DataSuitcases', function () {
      it("should exist", function () {
        should.exist(Collection);
      });

      it("should trigger an initialization event when initialized", function (done) {
        collection = new Collection();
        collection.once('initialize', done());
      });

      it("should set up it's data object", function () {
        collection.should.have.property('data');
      });
    });
  });
