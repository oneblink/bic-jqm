/*global chai:true, describe:true, it:true, before: true, beforeEach:true, after:true, afterEach:true, expect:true, should:true, sinon:true */
define('wrapper-backbone', ['backbone'], function (Backbone) {
  "use strict";
  Backbone.sync = sinon.spy();
  return Backbone;
});

define('model-interaction-mobile', ['backbone'], function (Backbone) {
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

define(['../../scripts/collection-interactions-mobile.js'],
  function (Collection) {
    "use strict";
    var collection;

    describe('Collection - Interactions', function () {
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

      describe('save()', function () {
        it("should persist any models to the data store", function (done) {
          require(['wrapper-backbone'], function (Backbone) {
            Backbone.sync.reset();
            collection.add({test: true}).save();
            should.equal(Backbone.sync.called, true);
            done();
          });
        });
      });
    });
  });
