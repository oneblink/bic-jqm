define(function () {
  'use strict';

  var mod = {};
  var noop = function () { return false; };

  // function domLog (msg) {
  //   var p = document.createElement('p');
  //   p.appendChild(document.createTextNode(msg));
  //   return document.body.appendChild(p);
  // }

  [
    'assert', 'debug', 'error', 'log', 'time', 'timeEnd', 'warn'
  ].forEach(function (prop) {
    if (window.console && typeof window.console[prop] === 'function') {
      mod[prop] = function (a, b) {
        // if (arguments.length >= 2) {
        //   domLog(prop + ': ' + a + ' ' + b);
        // } else {
        //   domLog(prop + ': ' + a);
        // }
        try {
          return window.console[prop].apply(window.console, arguments);
        } catch (err) {
          if (arguments.length >= 2) {
            return window.console[prop](a, b);
          }
          return window.console[prop](a);
        }
      };
    } else {
      mod[prop] = noop;
    }
  });

  return mod;
});
