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
  var $body = $('body'),
  templates = jqm.templates,
  /**
   * @inner
   * @constructor
   */
  InteractionPrompt = Backbone.View.extend({
    initialize: function() {
      var $el = $(_.template(templates.page, { page: '' })),
      $content = $(_.template(templates.content, { content: '' }));
      /* END: var */

      this.setElement($el);
      
      // adding HTML elements to the DOM
      $content.appendTo($el);
      $el.addClass('interactions');
      $el.appendTo($body);
    },
    render: function() {
      var $content = this.$el.children('div');
      $content.html('<p>[input prompt goes here]</p>');
      return this;
    },
    show: function() {
      this.render();
      jqm.changePage(this.$el);
      return this;
    }
  });
  /* END: var */
  return InteractionPrompt;
});
