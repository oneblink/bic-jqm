/*global chai:true, describe:true, it:true, before: true, beforeEach:true, after:true, afterEach:true, expect:true, should:true, sinon:true */
// define('wrapper-backbone', [], function () {
//   "use strict";
//   return Backbone;
// });

// define('model-datasuitcase-mobile', [], function () {
//   "use strict";
//   return Backbone.Model.extend();
// });

// define('model-form-mobile', [], function () {
//   "use strict";
//   return Backbone.Model.extend();
// });

// define('collection-datasuitcases-mobile', [], function () {
//   "use strict";
//   return Backbone.Collection.extend();
// });

// define('collection-forms-mobile', [], function () {
//   "use strict";
//   return Backbone.Collection.extend();
// });

// define('collection-interactions-mobile', [], function () {
//   "use strict";
//   return Backbone.Collection.extend();
// });

// define('collection-pending', [], function () {
//   "use strict";
//   return Backbone.Collection.extend();
// });

// define('collection-stars-mobile', [], function () {
//   "use strict";
//   return Backbone.Collection.extend();
// });

// define('data-pouch', [], function () {
//   "use strict";
//   return function () {};
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

  describe('Model - Application', function () {
    var Model, oInt, oDS, oForm, oPend, oStar, oData, oAPI;

    before(function (done) {
      require(['collection-interactions',
        'collection-datasuitcases',
        'collection-forms',
        'collection-pending',
        'data-inMemory',
        'api',
        'collection-stars'], function (
        InteractionCollection,
        DataSuitcaseCollection,
        FormCollection,
        PendingCollection,
        Data,
        API,
        StarsCollection
      ) {
        oInt = InteractionCollection;
        oDS = DataSuitcaseCollection;
        oForm = FormCollection;
        oPend = PendingCollection;
        oStar = StarsCollection;
        oData = Data;
        oAPI = StarsCollection;
        requirejs.undef('collection-interactions');
        requirejs.undef('collection-datasuitcases');
        requirejs.undef('collection-forms');
        requirejs.undef('collection-pending');
        requirejs.undef('collection-stars');
        requirejs.undef('data-inMemory');
        requirejs.undef('api');

        define('collection-interactions', [], function () {
          return Backbone.Collection;
        });

        define('collection-datasuitcases', [], function () {
          return Backbone.Collection;
        });

        define('collection-forms', [], function () {
          return Backbone.Collection;
        });

        define('collection-pending', [], function () {
          return Backbone.Collection;
        });

        define('collection-stars', [], function () {
          return Backbone.Collection;
        });

        define('data-inMemory', [], function () {
          return function (param) {console.log(param); };
        });

        define('api', [], function () {
          return function (param) {console.log(param); };
        });

        require(['model-application'], function (rModel) {
          Model = rModel;
          done();
        });
      });
    });

    after(function () {
      requirejs.undef('collection-interactions');
      requirejs.undef('collection-datasuitcases');
      requirejs.undef('collection-forms');
      requirejs.undef('collection-pending');
      requirejs.undef('collection-stars');
      requirejs.undef('data-inMemory');
      requirejs.undef('api');
      
      define('collection-interactions', ['model-interaction', 'feature!data'], function (Interaction, Data) {
        return function () {return oInt; };
      });

      define('collection-datasuitcases', ['model-datasuitcase', 'feature!data'], function (DataSuitcase, Data) {
        return function () {return oDS; };
      });

      define('collection-forms', ['model-form', 'feature!data'], function (Form, Data) {
        return function () {return oForm; };
      });

      define('collection-pending', ['model-pending', 'feature!data', 'api'], function (PendingItem, Data, API) {
        return function () {return oPend; };
      });

      define('collection-stars', ['model-star', 'feature!data'], function (Star, Data) {
        return function () {return oStar; };
      });

      define('data-inMemory', [], function () {
        return function () {return oData; };
      });

      define('api', [], function () {
        return function () {return oAPI; };
      });
    });

    it("should exist", function () {
      should.exist(Model);
    });

    it("should be an instance of backbone model", function () {
      Model.should.be.an.instanceOf(Backbone.Model);
    });

    describe('initialize()', function () {
      it("should set up it's data store");

      it("should create a collection for interactions");

      it("should create a collection for data suitcases");

      it("should create a collection for forms");

      it("should create a collection for pending items");

      it("should create a collection for stars");

      it("should trigger an 'initialize' event when this + all collections are fully initialized");
    });

    describe('populate()', function () {
      it("should do nothing if offline");

      it("should fetch the answerSpaceMap from API");

      it("should fill the interaction collection from map");

      it("should fill the answerSpace config from map");

      it("should parse interactions for data suitcases");

      it("should parse interactions for form objects");

      it("should trigger an 'initalize' event when complete");

      it("should return a promise");
    });
  });
});
