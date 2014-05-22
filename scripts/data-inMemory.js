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
        return Promise.reject();
      },

      update: function () {
        return Promise.reject();
      },

      read: function () {
        return Promise.reject();
      },

      readAll: function () {
        return Promise.reject();
      },

      'delete': function () {
        return Promise.reject();
      }
    });

    return Data;
  }
);
