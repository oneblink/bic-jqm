/*global chai:true, describe:true, it:true, before: true, beforeEach:true, after:true, afterEach:true, expect:true, should:true, sinon:true */
define('wrapper-backbone', ['backbone'], function (Backbone) {
  "use strict";
  Backbone.sync = sinon.spy();
  return Backbone;
});

define('model-star-mobile', ['backbone'], function (Backbone) {
  "use strict";
  return Backbone.Model.extend();
});

define('data-pouch', [], function () {
  "use strict";
  return sinon.spy();
});

window.BMP = {
  siteVars: {
    answerSpace: 'Exists',
    answerSpaceId: 1
  }
};


define(['../../scripts/collection-stars-mobile.js'],
  function (Collection) {
    "use strict";
    var collection;

    describe('Collection - Stars', function () {
      it("should exist", function () {
        should.exist(Collection);
      });

      describe('initialize()', function () {
        it("should trigger an initialization event when initialized", function (done) {
          collection = new Collection();
          collection.once('initialize', done());
        });

        it("should set up it's data object", function () {
          collection.should.have.property('data');
        });

        it("should have populated itself from the data store", function (done) {
          require(['data-pouch'], function (Data) {
            should.equal(Data.called, true);
            done();
          });
        });
      });

      describe('clear(type)', function () {
        it("should trigger model.destroy() on all models of given type", function (done) {
          require(['wrapper-backbone'], function (Backbone) {
            Backbone.sync.reset();
            collection.add({type: "test"}).clear("test");
            collection.length.should.equal(0);
            done();
          });
        });

        it("should ignore model not of given type", function (done) {
          require(['wrapper-backbone'], function (Backbone) {
            Backbone.sync.reset();
            collection.add({type: "nottest"}).clear("test");
            collection.length.should.equal(1);
            done();
          });
        });
      });
    });
  });
