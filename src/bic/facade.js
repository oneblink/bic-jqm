define(function (require) {
  'use strict';

  // local modules

  var mediator = require('bic/mediator');

  // this module

  var publish;
  var subscribe;

  publish = function () {
    mediator.publish.apply(this, arguments);
  };

  subscribe = function (subscriber, channel, callback) {
    // subscriber is here to allow future permission checking
    mediator.subscribe(channel, callback);
  };

  return {
    publish: publish,
    subscribe: subscribe
  };
});
