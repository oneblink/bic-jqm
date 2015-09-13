define(function (require) {
  'use strict';

  // local modules

  var c = require('bic/console');

  // this module

  var mediator;
  var log;

  mediator = {};
  mediator.channels = {};

  log = function (type, channel, args) {
    c.log(Date.now() + ': ' + type + ' ' + channel, args);
  };

  return {
    publish: function publish (channel) {
      var args;
      var i;
      var subscription;

      if (!mediator.channels[channel]) {
        return false;
      }
      args = Array.prototype.slice.call(arguments, 1);
      for (i = 0; i < mediator.channels[channel].length; i++) {
        subscription = mediator.channels[channel][i];
        subscription.callback.apply(subscription.context, args);
      }

      if (window.BMP.Debug) {
        log('Publish', channel, args);
      }

      return this;
    },

    subscribe: function subscribe (channel, fn) {
      if (!mediator.channels[channel]) {
        mediator.channels[channel] = [];
      }
      mediator.channels[channel].push({ context: this, callback: fn });

      if (window.BMP.Debug) {
        log('Subscribe', channel);
      }

      return this;
    }
  };
});
