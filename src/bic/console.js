define(function () {
  'use strict';

  // foreign modules

  var _ = require('underscore');

  // this module

  var mod = {};
  var noop = function () { return false; };

  function logToDOM () {
    var args = _.toArray(arguments);
    var li = document.createElement('li');
    li.appendChild(document.createTextNode(args.join(' ')));
    return mod.logElement.appendChild(li);
  }

  /** in order of decreasing noise / increasing importance */
  mod.LOG_LEVELS = ['debug', 'info', 'log', 'warn', 'error'];

  // mod.logLevel = 0; // 'debug'
  mod.logLevel = 2; // 'log'

  mod.logElement = null;

  mod.LOG_LEVELS.forEach(function (prop, level) {
    if (window.console && typeof window.console[prop] === 'function') {
      mod[prop] = function () {
        var args;
        if (mod.logLevel > level) {
          return false;
        }
        if (mod.logElement) {
          args = _.toArray(arguments);
          args.unshift(prop + ':');
          logToDOM.apply(null, args);
        }
        try {
          return window.console[prop].apply(window.console, arguments);
        } catch (ignore) { return false; }
      };
    } else {
      mod[prop] = noop;
    }
  });

  return mod;
});
