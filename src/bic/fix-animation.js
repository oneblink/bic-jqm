define(function (require) {
  'use strict';

  // foreign modules

  var $ = require('jquery');
  var _ = require('underscore');

  // local modules

  var c = require('bic/console');

  // this module

  function isJQMTransition (event) {
    var classes;
    if (!event || !event.target) {
      return false;
    }
    classes = event.target.className.split(' ');
    return _.contains(classes, 'fade') &&
      (_.contains(classes, 'in') || _.contains(classes, 'out'));
  }

  $(window).on('animationstart', function (event) {
    var timer;
    if (isJQMTransition(event)) {
      // okay, we need to set a 1s timer in case this doesn't finish
      timer = setTimeout(function () {
        c.warn('"animationend" event expected but not observed');
        $(event.target).trigger('animationend');
      }, 1e3);
      $(event.target).one('animationend', function () {
        clearTimeout(timer);
      });
    }
  });

});
