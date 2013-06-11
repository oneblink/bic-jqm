define(
  [],
  function () {
    "use strict";

    var Data = function () {};

    _.extend(Data.prototype, {
      data: {},

      create: function (model) {
        return new $.Deferred().reject().promise();
      },

      update: function (model) {
        return new $.Deferred().reject().promise();
      },

      read: function (model) {
        return new $.Deferred().reject().promise();
      },

      readAll: function () {
        return new $.Deferred().reject().promise();
      },

      delete: function (model) {
        return new $.Deferred().reject().promise();
      },

      deleteAll: function (model) {
        return new $.Deferred().reject().promise();
      }

    });

    return Data;
  }
);