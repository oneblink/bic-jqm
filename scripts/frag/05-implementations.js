define('es5-builtin', [], function () {
  'use strict';
  return {};
});


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
        implementation: 'es5-builtin'
      }
    ]
  };
});
