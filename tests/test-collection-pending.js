/*global chai:true, describe:true, it:true, before: true, beforeEach:true, after:true, afterEach:true, expect:true, should:true, sinon:true */
// define('wrapper-backbone', [], function () {
//   "use strict";
//   Backbone.sync = function () {};
//   return Backbone;
// });

// define('model-pending-mobile', [], function () {
//   "use strict";
//   return Backbone.Model.extend();
// });

// define('data-pouch', [], function () {
//   "use strict";
//   return sinon.spy();
// });

// define('api-php', ['../../scripts/api-php'], function (API) {
//   "use strict";
//   var stub = sinon.stub(API);
//   return stub;
// });

// window.BMP = {
//   siteVars: {
//     answerSpace: 'Exists',
//     answerSpaceId: 1
//   }
// };

define(function () {
  "use strict";
  describe('Collection - Pending', function () {
    var Collection, collection, originalModel, originalData, originalAPI;

    before(function (done) {
      require(['model-pending', 'data-inMemory', 'api'], function (Model, Data, API) {

        originalModel = Model;
        originalData = Data;
        originalAPI = API;
        requirejs.undef('model-pending');
        requirejs.undef('data-inMemory');
        requirejs.undef('api');

        define('model-pending', [], function () {
          return Backbone.Model;
        });

        define('data-inMemory', [], function () {
          return function (param) {console.log(param); };
        });
      
        define('api', [], function () {
          return function (param) {console.log(param); };
        });

        require(['collection-pending'], function (rCol) {
          Collection = rCol;
          done();
        });
      });
    });

    after(function () {
      requirejs.undef('model-pending');
      requirejs.undef('data-inMemory');
      requirejs.undef('api');
      define('api', [], function () {return originalAPI; });
      define('model-pending', ['api'], function (API) {return originalModel; });
      define('data-inMemory', [], function () {return originalData; });
    });

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

      // it("should have populated itself from the data store", function () {
      //   should.equal(Data.called, true);
      // });
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
