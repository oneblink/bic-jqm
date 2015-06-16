define(function (require) {
  'use strict';

  // local modules

  var Data = require('bic/data');

  // this module

  var NAME = window.BMP.BIC.siteVars.answerSpace.toLowerCase() + '-Meta';

  return new Data(NAME);

});
