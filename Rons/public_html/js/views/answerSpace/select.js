/*jslint browser:true*/ // assume "window" and other browser globals
/*jslint white:true*/ // ignore white-space issues
/*global define:true, require:true*/ // globals from Require.JS

/*jslint nomen:true*/ // rules for Underscore.JS

define([
  'logger',
  'jQuery',
  'underscore',
  'backbone',
  'jQueryMobile',
  'text!templates/answerSpace/select.html'
], function(logger, $, _, Backbone, jqm, template) {
  'use strict';
  var $body = $(window.document.body),
  SelectAnswerSpace = Backbone.View.extend({
    events: {
      'submit form': 'onSelect'
    },
    initialize: function() {
      this.render();
    },
    render: function() {
      var $page = $(_.template(template, { title: 'select answerSpace' })),
      $form = $page.children('div').children('form');
      /* END: var */
      $body.append($page);
      this.setElement($page);
      $form.on('submit', this.onSelect);
    },
    show: function() {
      jqm.pageContainer = jqm.pageContainer || $body;
      jqm.firstPage = jqm.firstPage || this.$el;
      jqm.changePage(this.$el, {
        allowSamePageTransition: true
      });
      this.trigger('pagecreate');
      setTimeout(function() {
        // for some reason jQuery Mobile doesn't automatically fix CSS here :S
        $body.removeClass('ui-mobile-viewport-transitioning viewport-slide');
        $('html').removeClass('ui-mobile-rendering ui-loading');
      }, 47);
    },
    onSelect: function(event) {
      var $form = $(this).closest('form'),
      $answerSpace = $form.children('[name=answerSpace]'),
      value = $.trim($answerSpace.val());
      /* END: var */
      if (_.isString(value) && value.length > 0) {
        Backbone.history.navigate('/' + value + '/', {
          trigger: true
        });
      }
      event.preventDefault();
      return false;
    }
  });
  return new SelectAnswerSpace();
});
