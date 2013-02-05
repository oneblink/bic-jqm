/*jslint browser:true*/ // assume "window" and other browser globals
/*jslint white:true*/ // ignore white-space issues
/*global define:true, require:true*/ // globals from Require.JS

/*jslint nomen:true*/ // rules for Underscore.JS

define([
  'logger',
  'jQuery',
  'underscore',
  'backbone'
], function(logger, $, _, Backbone) {
  'use strict';
  var Modernizr = window.Modernizr,
  Context = Backbone.Model.extend({
    defaults: {
      conditions: [],
      screen: { x: 0, y: 0 },
      viewport: { x: 0, y: 0 },
      numRequests: 0
    },
    is: function(condition) {
      var conditions = this.get('conditions');
      if (_.isString(condition) && condition.length > 0) {
        condition = condition.split(/\s+/);
      }
      if (_.isArray(condition)) {
        return _.intersection(conditions, condition).length > 0;
      }
      return false;
    },
    add: function(condition, isSilent) {
      var conditions = this.get('conditions');
      if (_.isString(condition) && condition.length > 0) {
        condition = condition.split(/\s+/);
      }
      if (_.isArray(condition)) {
        conditions = _.uniq(conditions.concat(condition));
      }
      this.set('conditions', conditions, { silent: !!isSilent });
    },
    remove: function(condition, isSilent) {
      var conditions = this.get('conditions');
      if (_.isString(condition) && condition.length > 0) {
        condition = condition.split(/\s+/);
      }
      if (_.isArray(condition)) {
        conditions = _.without.apply(_, [conditions].concat(condition));
      }
      this.set('conditions', conditions, { silent: !!isSilent });
    },
    setCondition: function(condition, value) {
      var conditions = this.get('conditions');
      if (_.isString(condition) && condition.length > 0) {
        if (value) {
          if (_.indexOf(conditions, condition) === -1) {
            conditions.push(condition);
          }
        } else {
          conditions = _.without(conditions, condition);
        }
        this.set('conditions', conditions);
        return condition;
      } else if (_.isArray(condition)) {
        conditions = _.uniq(_.union(conditions, condition));
        this.set('conditions', conditions);
        return condition;
      } else {
        return false;
      }
    },
    bumpRequests: function() {
      var numRequests = this.get('numRequests');
      try {
        numRequests = numRequests + 1;
      } catch (e) {
        numRequests = 0;
      }
      this.set('numRequests', numRequests, { silent: true });
      return numRequests;
    }
  }),
  context = new Context(),
  $html = $('html'),
  $window = $(window),
  /**
   * @inner
   */
	onNetworkChange = function() {
		var host;
//		if (window.device && navigator.network) { // TODO: check when this BlinkGap code will actually work (state.code === undefined)
//			host = siteVars.serverDomain ? siteVars.serverDomain.split(':')[0] : 'blinkm.co';
//			navigator.network.isReachable(host, networkReachableFn);
//		} else {
      if (window.navigator.onLine === context.is('online')) {
        $.noop(); // do nothing
      } else if (window.navigator.onLine) {
        context.add('online', true);
        context.remove('offline', true);
        context.change();
      } else { // offline
        context.add('offline', true);
        context.remove('online', true);
        context.change();
      }
//		}
	};
  /* END: var */

  $window.bind('online', onNetworkChange);
  $window.bind('offline', onNetworkChange);
  onNetworkChange(); // $window.trigger('online');

  Context.prototype.isBlinkGap = function() {
    return window.PhoneGap && $.isObject(window.device) && window.device instanceof window.Device;
  };
  

  return context;
});
