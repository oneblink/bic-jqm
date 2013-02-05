/**
 * this model describes an Interaction from which Categories,
 * Master Categories and answerSpaces inherit
 */

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
  var bmp = window.BlinkApp,
  /**
   * @inner
   */
  onChange = function(model, attribute) {
    var ancestors = model.get('_ancestors'),
    combined = {},
    name = model.get('name') || model.get('siteName') || model.id;
    /* END: var */
    if (!_.isArray(ancestors)) {
      ancestors = [];
    }
    ancestors.push(model);
    /*logger.log(JSON.stringify(_.map(ancestors, function(model) {
      return model.get('name') || model.get('siteName');
    }))); */
    $.each(ancestors, function(index, ancestor) {
      var config = ancestor.get('_config');
      if ($.isObject(config) && $.isObject(config.pertinent)) {
        $.extend(combined, config.pertinent);
      }
    });
    model.set(combined, {silent: true});
  },
  /**
   * @inner
   * @constructor
   */
  Interaction = Backbone.Model.extend({
    defaults: {
      id: null,
      _config: null,
      name: null,
      _ancestors: null // does this need to be a Collection?
    },
    initialize: function() {
      var self = this,
      id = this.id;
      /* END: var */
      // if not an answerSpace, get ready to process ancestors
      if (!_.isString(id) || id.length === 0 || id.charAt(0) !== 'a') {
        this.on('change:_ancestors', onChange);
        this.on('change:_config', onChange);
        onChange(this);
      }
    },
    fetch: function(options) {
      var self = this,
      ajax;
      /* END: var */
      jqm.showPageLoadingMsg();
      ajax = $.ajax({
        url: '/_BICv3_/xhr/GetAnswer.php',
        type: 'GET',
        data: {
          asn: bmp.answerSpace.get('name'),
          iact: self.get('name')
        }
      })
      .always(function(response, status, jqxhr) {
        if (jqxhr.status === 200) {
          self.set('_result', response);
          self.set('_lastFetch', $.now());
        }
        // run any handlers that were passed in options
        if (jqxhr.status === 200 || jqxhr.status === 304 || jqxhr.status === 0) {
          if ($.isObject(options) && _.isFunction(options.success)) {
            options.success(self, jqxhr.status);
          }
        } else {
          if ($.isObject(options) && _.isFunction(options.error)) { 
            options.error(self, jqxhr.status);
          }
        }
        // TODO: only trigger the change event when we know we need it
        jqm.hidePageLoadingMsg();
        self.change();
      });
      return ajax.promise();
    },
    isViewable: function() {
      // default to "show"
      return this.get('display') !== 'hide';
    },
    addAncestor: function(ancestor) {
      if (_.indexOf(this.attributes.ancestors, ancestor) === -1) {
        this.attributes.ancestors.push(ancestor);
        this.trigger('change:ancestors');
      }
    },
    resetAncestors: function() {
      if (!_.isEmpty(this.attributes.ancestors)) {
        this.attributes.ancestors = [];
        this.trigger('change:ancestors');
      }
    }
  });
  /* END: var */
  
  return Interaction;
});
