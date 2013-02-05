/*jslint browser:true*/ // assume "window" and other browser globals
/*jslint white:true*/ // ignore white-space issues
/*global define:true, require:true*/ // globals from Require.JS

/*jslint nomen:true*/ // rules for Underscore.JS

define([
  'require',
  'logger',
  'jQuery',
  'underscore',
  'backbone',
  'jQueryMobile',
  'BlinkDispatch',
  'Math',
  'models/Context',
  'text!templates/messages/needOnline.html',
  'text!templates/messages/noFormsLibrary.html'
], function(require, logger, $, _, Backbone, jqm, BlinkDispatch, Math, context,
    txtNeedOnline, txtNoForms) {
  'use strict';
  var $body = $('body'),
  bmp = window.BlinkApp,
  templates = jqm.templates,
  /**
   * @inner
   * @constructor
   */
  InteractionResult = Backbone.View.extend({
    initialize: function() {
      var $el = $(_.template(templates.page, {page: ''})),
      $content = $(_.template(templates.content, {content: ''})),
      $header = $(_.template(templates.header, {header: ''})),
      $a,
      name = this.model.get('displayName') || this.model.get('name');
      /* END: var */

      this.setElement($el);
      
      // fixing header
      $a = $(templates.back);
      $a.appendTo($header);
      $header.append('<h1>' + name + '</h1>');
      $header.attr('data-position', 'fixed');
      $header.appendTo($el);

      // adding HTML elements to the DOM
      $content.appendTo($el);
      $el.addClass('interactions');
      $el.appendTo($body);
    },
    render: function() {
      var self = this,
      dfrd = new $.Deferred(),
      $content = this.$el.children('div'),
      type = this.model.get('type'),
      html,
      onlineTypes = ['madl code'],
      $form;
      /* END: var */
      
      if (!window.XSLTProcessor) {
        onlineTypes.push('xslt');
      }
      if (!window.BlinkForms || !window.BlinkFormObject) {
        onlineTypes.push('form');
      }
      
      if (context.is('offline') && $.inArray(type, onlineTypes) !== -1) {
        this.$el.remove();
        this.setElement($(txtNeedOnline));
        $body.append(this.$el);
        dfrd.resolve();
        return dfrd.promise();
      }
      
      if (type === 'message') {
        $content.html(this.model.get('message'));
        dfrd.resolve();
        
      } else if (type === 'madl code') {
        $.when(this.model.fetch())
        .always(function() {
          $content.html(self.model.get('_result'));
          dfrd.resolve();
        });
      
      } else if (type === 'form') {
        try {
          require(['lib/BlinkForms'], function(BlinkForms) {
            $form = $('<form></form>');
            $form.attr({
              'data-object-name': self.model.get('blinkFormObjectName'),
              'data-action': self.model.get('blinkFormAction')
            });
            $content.empty();
            $content.append($form);
            setTimeout(function() {
              $.when(BlinkForms.initialiseForm($form))
              .always(dfrd.resolve);
            }, 0);
          });
        } catch (e) {
          logger.error(e);
          self.$el.remove();
          self.setElement($(txtNoForms));
          $body.append(self.$el);
          dfrd.resolve();
        }
      
      } else {
        html = '<p>[Interaction result goes here]</p>';
        html += '<p>Interaction type: ' + this.model.get('type') + '</p>';
        $content.html(html);
        dfrd.resolve();
      }
      return dfrd.promise();
    },
    show: function() {
      var self = this;
      $.when(this.render())
      .always(function() {
        jqm.changePage(self.$el);
      });
      return this;
    }
  });
  /* END: var */
  return InteractionResult;
});
