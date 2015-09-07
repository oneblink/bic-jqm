define(function (require) {
  'use strict';

  // foreign modules

  var _ = require('underscore');
  var Backbone = require('backbone');
  var Promise = require('bic/promise');

  // local modules

  var Data = require('bic/data');

  return Backbone.Collection.extend({
    model: Backbone.Model,

    initialize: function () {

    },

    datastore: function (name) {
      this.data = new Data(name);

      // this method is chained in a few places, so explicitly return `this`
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
