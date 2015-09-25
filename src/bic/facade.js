define(function (require) {
  'use strict';

  // local modules

  var mediator = require('bic/mediator');

  // this module

  return {
    publish: function publish () {
      mediator.publish.apply(this, arguments);
    },

    subscribe: function subscribe (subscriber, channel, callback) {
      // subscriber is here to allow future permission checking
      mediator.subscribe(channel, callback);
    }
  };
});
