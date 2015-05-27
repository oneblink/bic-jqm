/*globals Backbone:false*/
define(function (require) {
  'use strict';

  var Data = require('data');

  return Backbone.Collection.extend({
    model: Backbone.Model,

    initialize: function () {

    },

    datastore: function (name) {
      this.data = new Data(name);
      return this;
    },

    load: function () {
      var collection = this;

      return new Promise(function (resolve, reject) {
        collection.fetch({
          success: resolve,
          error: reject
        });
      });
    },

    save: function () {
      return Promise.all(_.map(this.models, function (model) {
        return new Promise(function (resolve, reject) {
          model.save({}, {
            success: resolve,
            error: reject
          });
        });
      }));
    }

  });

});