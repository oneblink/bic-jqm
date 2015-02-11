define([], function () {
  'use strict';

  var publish;
  var subscribe;
  var mediator;

  mediator = {};
  mediator.channels = {};

  publish = function (channel) {
    console.log('Mediator Publish', arguments);
    var args;

    if (!mediator.channels[channel]) {
      return false;
    }
    args = Array.prototype.slice.call(arguments, 1);
    for (var i = 0; i < mediator.channels[channel].length; i++) {
      var subscription = mediator.channels[channel][i];
      subscription.callback.apply(subscription.context, args);
    }
    return this;
  };

  subscribe = function (channel, fn) {
    console.log('Mediator Subscribe', arguments);
    if (!mediator.channels[channel]) {
      mediator.channels[channel] = [];
    }
    mediator.channels[channel].push({ context: this, callback: fn });
    return this;
  };

  return {
    publish: publish,
    subscribe: subscribe
  };
});
