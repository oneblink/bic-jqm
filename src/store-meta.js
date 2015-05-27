/*globals Backbone:false*/
define(function (require) {
  'use strict';

  var NAME = window.BMP.BIC.siteVars.answerSpace.toLowerCase() + '-Meta';

  var Data = require('data');

  return new Data(NAME);

});
