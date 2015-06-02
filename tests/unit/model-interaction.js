define(['Squire'], function (Squire) {
  'use strict';
  describe('Model - Interaction', function () {
    var injector, Model;

    before(function (done) {
      injector = new Squire();

      injector.mock('api', function () { return null; });

      /*eslint-disable no-console*/ // just for testing
      injector.mock('facade', {
        publish: function () { console.log('#publish'); },
        subscribe: function () { console.log('#subscribe'); }
      });
      /*eslint-enable no-console*/

      injector.require(['../src/model-interaction'], function (required) {
        Model = required;
        done();
      });
    });

    it('should exist', function () {
      should.exist(Model);
    });

    it('should be a constructor function', function () {
      Model.should.be.an.instanceOf(Function);
    });

//////////////////////////////////////////////////////////

    describe('setArgument()', function(){
      var interaction;
      beforeEach(function(){
        interaction = new Model();
      });

      afterEach(function(){
        interaction = undefined;
      });

      it('should set the same argument', function(){
        interaction.setArgument('test', 10);
        assert.equal(interaction.get('args')['args[test]'], 10);

        interaction.setArgument('args[test]', 20);
        assert.equal(interaction.get('args')['args[test]'], 20);

        assert.equal(Object.keys(interaction.get('args')).length, 1);
      });
    });

//////////////////////////////////////////////////////////

    describe('getArgument()', function(){
      var interaction;
      beforeEach(function(){
        interaction = new Model();
      });

      afterEach(function(){
        interaction = undefined;
      });

      it('should set and get the same argument', function(){
        interaction.setArgument('test', 10);
        assert.equal(interaction.getArgument('test'), 10);

        interaction.setArgument('args[test]', 20);
        assert.equal(interaction.getArgument('args[test]'), 20);

        assert.equal(Object.keys(interaction.get('args')).length, 1);
      });
    });

//////////////////////////////////////////////////////////

    describe('setArgsFromQueryString()', function(){
      var interaction;
      beforeEach(function(){
        interaction = new Model();
      });

      afterEach(function(){
        interaction = undefined;
      });

      it('should set attributes.args to null', function(){
        interaction.setArgsFromQueryString('');

        assert.isNull(interaction.get('args'));
      });

      it('should set the atrributes.args values correctly', function(){
        var expected = {};

        expected['args[pid]'] = 123;
        interaction.setArgsFromQueryString('?args[pid]=123');

        assert.equal(interaction.get('args')['args[pid]'], expected['args[pid]']);
      });

      it('should convert multiple arguments of the same name to arrays', function(){
        interaction.setArgsFromQueryString('?args[pid]=123&arr[]=0&arr[]=1&arr[]=2');

        assert.isArray(interaction.get('args')['args[arr]']);
        assert.equal(interaction.get('args')['args[arr]'].length, 3);

        interaction.get('args')['args[arr]'].forEach(function(val, index){
          assert.equal(val, index);
        });
      });

      it('should convert multiple arguments of the same name to arrays, using the getters', function(){
        interaction.setArgsFromQueryString('?args[pid]=123&arr[]=0&arr[]=1&arr[]=2');

        assert.isArray(interaction.getArgument('arr'));
        assert.equal(interaction.getArgument('arr').length, 3);

        interaction.getArgument('arr').forEach(function(val, index){
          assert.equal(val, index);
        });
      });

      it('should convert multiple arguments of the same name to arrays, even when wrapped in "args[]"', function(){
        interaction.setArgsFromQueryString('?args[pid]=123&args[arr[]]=0&args[arr[]]=1&args[arr[]]=2');

        assert.isArray(interaction.get('args')['args[arr]']);
        assert.equal(interaction.get('args')['args[arr]'].length, 3);

        interaction.get('args')['args[arr]'].forEach(function(val, index){
          assert.equal(val, index);
        });
      });
    });

//////////////////////////////////////////////////////////

    describe('inherit(config)', function () {
      it('should set the parent of this item for the inheritance chain');
    });

    describe('performXSLT()', function () {
      it('should substitute $args[] in the XSL template');

      it('should substitute blink-stars statements in the XSL template');

      it('should do the transformation and save the result to the model as content');

      it('should throw appropriate errors if the data is malformed');
    });

    describe('prepareView(data)', function () {
      it('should detect if you are on the home screen and load in homeInteraction');

      it('should detect if you are on the home screen and generate a list of items');

      it('should detect if you are on a MADL interaction and fetch result from server');

      it('should save the MADL result for offline access');

      it('should detect if you are on a Stars XSLT interaction and prepare the XML');

      it('should return a promise');
    });
  });
});
