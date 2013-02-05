/*jslint browser:true*/ // assume "window" and other browser globals
/*jslint white:true*/ // ignore white-space issues
/*global define:true, require:true*/ // globals from Require.JS

/*jslint nomen:true*/ // rules for Underscore.JS

define([
  'logger',
  'jQuery',
  'underscore',
  'backbone',
  'jQueryMobile'
], function(logger, $, _, Backbone, jqm) {
  'use strict';
  var AnswerSpaceView = Backbone.View.extend({
    initialize: function() {
      var self = this;
      this.model.on('change', function() {
        self.render();
      });
    },
    render: function() {
      return this;
    }
  });
  return AnswerSpaceView;
});
