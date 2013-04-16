/*jslint browser:true*/ // assume "window" and other browser globals
/*jslint white:true*/ // ignore white-space issues
/*global define:true, require:true*/ // globals from Require.JS

/*jslint nomen:true*/ // rules for Underscore.JS

define([
  'logger',
  'jQuery',
  'underscore',
  'backbone',
  'model-interaction-mobile'
], function(logger, $, _, Backbone, Interaction) {
  'use strict';
  var bmp = window.BlinkApp,
  InteractionList = Backbone.Collection.extend({
    model: Interaction,
    initialize: function(models, options) {
      var self = this;
      
      options = $.isObject(options) ? options : {};
      options.tags = _.isArray(options.tags) ? options.tags : [];
      this.options = options;
      
      $.each(bmp.interactions, function(name, model) {
        var tags = model.get('tags'),
        common = _.intersection(tags, options.tags);
        /* END: var */
        if (common.length > 0) {
          //self.add(model, { silent: true }); // weird that this doesn't work'
          models.push(model); // do this instead, it works /shrug
        }
      });
    },
    /**
     * automatically called on "add" to keep Models sorted
     */
    comparator: function(a, b) {
      var orderA = a.get('order') || 0,
      orderB = b.get('order') || 0,
      nameA,
      nameB;
      /* END: var */
      if (orderA !== orderB) {
        return orderA < orderB ? -1 : 1;
      }
      nameA = (a.get('displayName') || a.get('name')).toLowerCase();
      nameB = (b.get('displayName') || b.get('name')).toLowerCase();
      if (nameA !== nameB) {
        return nameA < nameB ? -1 : 1;
      }
      return 0;
    }
  });
  return InteractionList;
});
