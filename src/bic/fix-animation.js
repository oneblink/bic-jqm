define(function (require) {
  'use strict';

  // foreign modules

  var $ = require('jquery');
  var $mobile = require('jquerymobile');
  var _ = require('underscore');

  // local modules

  var c = require('bic/console');

  // this module

  var $document = $(document);
  var TRANSITIONS = Object.keys($mobile.transitionFallbacks);
  TRANSITIONS.push('fade');

  function isJQMTransition (event) {
    var classes;
    if (!event || !event.target) {
      return false;
    }
    classes = event.target.className.split(' ');
    return (_.contains(classes, 'in') || _.contains(classes, 'out')) &&
      !!_.intersection(classes, TRANSITIONS).length;
  }

  $document.on('animationstart', function (event) {
    var timer;
    if (isJQMTransition(event)) {
      // okay, we need to set a 1s timer in case this doesn't finish
      timer = setTimeout(function () {
        c.warn('"animationend" event expected but not observed');
        $(event.target).trigger('animationend');
      }, 1e3);
      $document.one('animationend', function () {
        // https://github.com/jquery/jquery-mobile/issues/6515
        $.mobile.pageContainer.removeClass('ui-mobile-viewport-transitioning');
        clearTimeout(timer);
      });
    }
  });
});
