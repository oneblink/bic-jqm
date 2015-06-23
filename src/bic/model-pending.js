define(function () {
  'use strict';

  // foreign modules

  var Backbone = require('backbone');

  // this module

  var PendingItem = Backbone.Model.extend({
    idAttribute: '_id'
  });

  return PendingItem;
});
