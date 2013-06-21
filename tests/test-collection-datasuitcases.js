/*global chai:true, describe:true, it:true, before: true, beforeEach:true, after:true, afterEach:true, expect:true, should:true, sinon:true */
define(function () {
  describe('Collection - DataSuitcases', function () {
    var Collection, collection, originalModel, originalData;

    before(function (done) {
      require(['model-datasuitcase', 'feature!data'], function (DataSuitcase, Data) {

        originalModel = DataSuitcase;
        originalData = Data;
        requirejs.undef('model-datasuitcase');
        requirejs.undef('feature!data');

        define('model-datasuitcase', [], function () {
          return Backbone.Model;
        });

        define('feature!data', [], function () {
          return function (param) {console.log(param)};
        });

        require(['collection-datasuitcases'], function (rColl) {
          Collection = rColl;
          collection = new Collection();
          done();
        });
      });
    });

    after(function () {
      console.log(originalData);
      requirejs.undef('model-datasuitcase');
      requirejs.undef('feature!data');
      define('model-datasuitcase', ['api'], originalModel);
      define('feature!data', [], originalData);
      require(['feature!data'], function(data){console.log(data);});
    });

    it("should exist", function () {
      should.exist(Collection);
    });

    describe('initialize()', function (done) {
      it("should provide a promise that is resolved when initialization is complete", function () {
        collection.should.have.property('initialize');
        collection.initialize.always(function () {
          done();
        });
      });

      it("should set up it's data object", function () {
        collection.should.have.property('data');
      });

      it("should have populated itself from the data store");
    });
  });
});
