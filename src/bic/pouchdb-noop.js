define(function () {
  'use strict';

  function asyncError (model, callback) {
    callback(new Error('memory-only storage has no existing records'));
  }

  return {

    allDocs: function (where, callback) {
      callback(null, { rows: [] });
    },

    destroy: function (callback) {
      callback(null);
    },

    get: asyncError,

    post: function (model, callback) {
      callback(null, { id: 1, _id: 1 });
    },

    put: asyncError,

    remove: asyncError

  };

});
