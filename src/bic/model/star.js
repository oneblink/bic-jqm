define(function (require) {
  'use strict';

  // foreign modules

  var Backbone = require('backbone');

  // this module

  var Star = Backbone.Model.extend({
    idAttribute: '_id',

    initialize: function () {
      this.on('add', function () {
        this.save();
      }.bind(this));
    },

    toggle: function () {
      var model = this;
      if (model.get('state')) {
        this.set('state', false);
      } else {
        this.set('state', true);
      }
      require(['bic/model/application'], function (app) {
        if (model.get('state')) {
          app.stars.add(model);
        } else {
          model.destroy();
        }
      });
    }
  });

  return Star;
});
