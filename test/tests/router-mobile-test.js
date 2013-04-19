/*global chai:true, describe:true, it:true, before: true, beforeEach:true, after:true, afterEach:true, expect:true, should:true, sinon:true */

define([ '../scripts/data-pouch.js'],
  function (Backbone) {
    "use strict";
    describe('Data Abstraction Layer - PouchDB Implementation', function () {
      describe('Backbone.sync', function () {
        it('should hijack the default Backbone.sync implementation');
        it('should succesfully handle requests to Backbone.sync');
      });
      describe('data object', function () {
        it('should provide a function to fetch a model\'s contents from the server');
        describe('data.getModel', function () {
          it('should persist data using the IndexedDB implementation in web browsers');
          it('should persist data using the websql implementation in cordova');
          it('shoud fallback to ajax if in a web browser that doesn\'t support IndexedDB');
          it('shoud cache data in the persistant store for the length of time specified');
          it('shoud fetch the model again and update the persisted version if the cached model is stale');
        });
      });
    });
      
  });
