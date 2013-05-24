/*global chai:true, describe:true, it:true, before: true, beforeEach:true, after:true, afterEach:true, expect:true, should:true, sinon:true */
define('wrapper-backbone', ['backbone'], function (Backbone) {
  "use strict";
  Backbone.sync = function () {};
  return Backbone;
});

define('model-pending-mobile', ['backbone'], function (Backbone) {
  "use strict";
  return Backbone.Model.extend();
});

define('data-pouch', [], function () {
  "use strict";
  return sinon.spy();
});

define('api-php', ['../../scripts/api-php'], function (API) {
  "use strict";
  var stub = sinon.stub(API);
  return stub;
});

window.BMP = {
  siteVars: {
    answerSpace: 'Exists',
    answerSpaceId: 1
  }
};

define(['../../scripts/collection-pending.js'],
  function (Collection) {
    "use strict";
    var collection;

    describe('Collection - Pending', function () {
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

      describe('processQueue()', function () {
        it("should do nothing when offline");

        it("should send pending items to the server when online");

        it("should remove items from the queue after sucessful submission");

        it("should keep items in the queue after failed submission");

        it("should retain draft items");
      });
    });
  });
