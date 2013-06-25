/*global chai:true, describe:true, it:true, before: true, beforeEach:true, after:true, afterEach:true, expect:true, should:true, sinon:true */
// define('wrapper-backbone', [], function () {
//   "use strict";
//   Backbone.sync = sinon.spy();
//   return Backbone;
// });

// define('model-interaction-mobile', [], function () {
//   "use strict";
//   return Backbone.Model.extend();
// });

// define('data-pouch', [], function () {
//   "use strict";
//   return sinon.spy();
// });

// window.BMP = {
//   siteVars: {
//     answerSpace: 'Exists',
//     answerSpaceId: 1
//   }
// };

define(function () {
  "use strict";
  var Collection, collection;

  describe('Collection - Interactions', function () {
    var Collection, collection, originalModel, originalData;

    before(function (done) {
      require(['model-interaction', 'data-inMemory'], function (Model, Data) {

        originalModel = Model;
        originalData = Data;
        requirejs.undef('model-interaction');
        requirejs.undef('data-inMemory');

        define('model-interaction', [], function () {
          return Backbone.Model;
        });

        define('data-inMemory', [], function () {
          return function (param) {console.log(param)};
        });
        
        require(['collection-interactions'], function (rCol) {
          Collection = rCol;
          done();
        });
      });
    });

    after(function () {
      requirejs.undef('model-interaction');
      requirejs.undef('data-inMemory');
      define('model-interaction', ['api'], function (API) {return originalModel; });
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

      it("should have populated itself from the data store");

    });

    describe('save()', function () {
      it("should persist any models to the data store");
        // , function (done) {
        // Backbone.sync.reset();
        // collection.add({test: true}).save();
        // should.equal(Backbone.sync.called, true);
        // done();
      // });
    });
  });
});
