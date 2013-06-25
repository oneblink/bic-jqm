/*global chai:true, describe:true, it:true, before: true, beforeEach:true, after:true, afterEach:true, expect:true, should:true, sinon:true */
// define('wrapper-backbone', [], function () {
//   "use strict";
//   Backbone.sync = function () {};
//   return Backbone;
// });

// define('BlinkForms', [], function () {
//   "use strict";
//   return {};
// });

// define('model-form-mobile', [], function () {
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
  describe('Collection - Forms', function () {
    var Collection, collection, originalModel, originalData;

    before(function (done) {
      require(['model-form', 'data-inMemory'], function (Model, Data) {

        originalModel = Model;
        originalData = Data;
        requirejs.undef('model-form');
        requirejs.undef('data-inMemory');

        define('model-form', [], function () {
          return Backbone.Model;
        });

        define('data-inMemory', [], function () {
          return function (param) {console.log(param)};
        });

        require(['collection-forms'], function (rCol) {
          Collection = rCol;
          done();
        });
      });
    });

    after(function () {
      requirejs.undef('model-form');
      requirejs.undef('data-inMemory');
      define('model-form', ['api'], function (API) {return originalModel; });
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

      it("should have created BlinkForms.getDefinition", function () {
          window.BlinkForms.should.have.property('getDefinition');
      });
    });
  });

  describe('BlinkForms.getDefinition(name, action)', function () {
    it("should create a valid form definition");
  });
});
