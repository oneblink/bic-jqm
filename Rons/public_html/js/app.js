/*jslint browser:true*/ // assume "window" and other browser globals
/*jslint white:true*/ // ignore white-space issues
/*global define:true, require:true*/ // globals from require.JS

/*jslint nomen:true*/ // rules for Underscore.JS

define([
  'logger',
  'jQuery',
  'underscore',
  'backbone',
  'jQueryMobile',
  'routers/default'
  ], function(logger, $, _, Backbone, jqm, router) {
    'use strict';
    var $body = $('body'),
    ba = window.BlinkApp;
    /* END: var */
    
    /* Perform tests to confirm whether we should use AJAX-free B-grade, or
     * full-featured A-grade support.
     */
    if ($.support.ajax && !jqm.ajaxBlackList) {
      ba.grade = 'a';
    } else {
      ba.grade = 'b';
    }
    
    ba.onLinkClick = function(event) {
      var $a = $(event.target).closest('a'),
      href = $a.attr('href'),
      isRelative,
      domain,
      index,
      name = ba.answerSpace.get('name'),
      interaction = $a.jqmData('interaction') || $a.attr('interaction');
      /* END: var */
      if (href) {
        isRelative = !(/^\/\//).test(href) && !(/^\w+:\/\//).test(href);
        /*jslint regexp:true*/
        domain = !isRelative && href.match(/\/\/\/?([^\/\s]*)\/?/);
        /*jslint regexp:false*/
        if (isRelative) {
          href = href.replace(/^\.\.\//, '/' + name + '/');
          Backbone.history.navigate(href, {
            trigger: true
          });
        } else if (domain && domain[0] === window.location.hostname) {
          // for <a> with a URL to the same domain
          href = href.replace(new RegExp('/^.*' + domain[0] + '/g'), '');
          Backbone.history.navigate(href, {
            trigger: true
          });
        } else {
          // for <a> with non-relative URL
          window.location.assign(href);
        }
        event.preventDefault();
        return false;
      } else if (interaction) {
        // for <a> with no href attribute
        href = '/' + name + '/' + interaction;
        Backbone.history.navigate(href, {
          trigger: true
        });
        event.preventDefault();
        return false;
      } else if ($a.data('rel') === 'home') {
        href = '/' + name + '/';
        Backbone.history.navigate(href, {
          trigger: true
        });
        event.preventDefault();
        return false;
      }
    };
    
    if (ba.grade === 'a') {
      $body.on('click', 'a', ba.onLinkClick);
    }

    return {
      initialize: function() {
        if (ba.grade !== 'a') {
          return;
        }
        Backbone.history.start({
          // TODO: use a blacklist for devices with broken HTML5 History
          pushState: $.support.pushState, 
          root: "/"
        });
        // go!
        router.initialize();
      }
    };
  });
