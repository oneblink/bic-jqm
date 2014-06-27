define('implementations', [], function () {
  'use strict';
  return {
    'es5': [
      {
        isAvailable: function () {
          // https://github.com/Modernizr/Modernizr/blob/master/feature-detects/es5/array.js
          return !(Array.prototype &&
            Array.prototype.every &&
            Array.prototype.filter &&
            Array.prototype.forEach &&
            Array.prototype.indexOf &&
            Array.prototype.lastIndexOf &&
            Array.prototype.map &&
            Array.prototype.some &&
            Array.prototype.reduce &&
            Array.prototype.reduceRight &&
            Array.isArray);
        },
        implementation: 'es5-shim'
      },
      {
        isAvailable: function () { return true; },
        module: function () {
          return {};
        }
      }
    ],
    promises: [
      {
        // native ES6 Promises
        isAvailable: function () {
          // https://github.com/Modernizr/Modernizr/blob/master/feature-detects/es6/promises.js
          return 'Promise' in window &&
            'resolve' in window.Promise &&
            'reject' in window.Promise &&
            'all' in window.Promise &&
            'race' in window.Promise &&
            (function() {
              var resolve;
              new window.Promise(function(r) { resolve = r; });
              return typeof resolve === 'function';
            }());
        },
        module: function () {
          return Promise;
        }
      },
      {
        // fallback to Bluebird
        isAvailable: function () { return true; },
        implementation: 'bluebird'
      }
    ]
  };
});
