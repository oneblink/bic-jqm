/*jslint sub:true*/ // we need to use obj['prop'] instead of obj.prop for IE8
define(
  [],
  function () {
    "use strict";

    var Data = function () {
      this.data = {};
    };

    _.extend(Data.prototype, {
      create: function () {
        return Promise.reject('Persistent storage not available');
      },

      update: function () {
        return Promise.reject('Persistent storage not available');
      },

      read: function () {
        return Promise.reject('Persistent storage not available');
      },

      readAll: function () {
        return Promise.reject('Persistent storage not available');
      },

      'delete': function () {
        return Promise.reject('Persistent storage not available');
      }
    });

    return Data;
  }
);
