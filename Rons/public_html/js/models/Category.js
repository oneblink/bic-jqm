/*jslint browser:true*/ // assume "window" and other browser globals
/*jslint white:true*/ // ignore white-space issues
/*global define:true, require:true*/ // globals from Require.JS

/*jslint nomen:true*/ // rules for Underscore.JS

define([
  'logger',
  'jQuery',
  'underscore',
  'backbone',
  'models/Interaction'
], function(logger, $, _, Backbone, Interaction) {
  'use strict';
  var Category = Interaction.extend({
    initialize: function() {}
  });
  return Category;
});
