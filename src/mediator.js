define([], function () {
  'use strict';

  var publish;
  var subscribe;
  var mediator;
  var log;

  mediator = {};
  mediator.channels = {};

  log = function (type, channel, args) {
    /*eslint-disable no-console*/
    console.log(Date.now() + ': ' + type + ' ' + channel, args);
    /*eslint-enable no-console*/
  };

  publish = function (channel) {
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

    if (BMP.Debug) {
      log('Publish', channel, args);
    }

    return this;
  };

  subscribe = function (channel, fn) {
    if (!mediator.channels[channel]) {
      mediator.channels[channel] = [];
    }
    mediator.channels[channel].push({ context: this, callback: fn });

    if (BMP.Debug) {
      log('Subscribe', channel);
    }

    return this;
  };

  return {
    publish: publish,
    subscribe: subscribe
  };
});
