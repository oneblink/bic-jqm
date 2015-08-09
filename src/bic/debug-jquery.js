define(function (require) {
  'use strict';

  // foreign modules

  var $ = require('jquery');

  // local modules

  var c = require('bic/console');

  // this module

  var oldOnError = window.onerror;
  // var support = {};

  require('feature!es5');
  require('jquerymobile');

  // Object.keys($.support).forEach(function (prop) {
  //   if (typeof $.support[prop] === 'boolean') {
  //     support[prop] = $.support[prop];
  //   }
  // });
  // c.debug('$.support: ' + JSON.stringify(support, null, 2));
  // support = null;

  function toString (value) {
    if (Array.isArray(value)) {
      return 'array[' + value.length + ']';
    }
    if (value === null || value === undefined || typeof value === 'boolean' || typeof value === 'number') {
      return '' + value;
    }
    if (typeof value === 'string') {
      if (value.length <= 20) {
        return '"' + value + '"';
      }
      return '"' + value.substring(0, 20) + '..."[' + value.length + ']';
    }
    return typeof value;
  }

  function elToString (el) {
    var output = el.tagName;
    if (el.id) {
      output += '#' + el.id;
    }
    return output;
  }

  function logEvent (event, prefix) {
    var target;
    prefix = prefix || '';
    if (!event || !event.target || event.target === window) {
      target = 'WINDOW';
    } else {
      target = elToString(event.target);
    }
    c.debug(prefix + 'event: ' + event.type + ' on ' + target);
  }

  function logFnDecorator (fn, prefix) {
    var oldFn = fn.context[fn.name];
    prefix = prefix || '';
    fn.context[fn.name] = function (first) {
      c.debug(prefix + fn.name + '(' + toString(first) + '): ...');
      return oldFn.apply(this, arguments);
    };
  }

  window.onerror = function (msg, url, line) {
    c.error([msg, url, line].join(' '));
    if (oldOnError) {
      return oldOnError(msg, url, line);
    }
    return true;
  };

  /* eslint-disable indent */ // ESLint seems to be very confused about below

  [
    'animationend', 'animationstart', 'pagehide', 'pageshow'
  ].forEach(function (name) {
    $(window).on(name, function (event) {
      logEvent(event, '');
    });
  });

  [
    'hashchange', 'navigate', 'pagebeforechange', 'pagebeforecreate',
    'pagebeforehide', 'pagebeforeload', 'pagebeforeshow', 'pagechange',
    'pagechangefailed', 'pagecreate', 'pageinit', 'pageload', 'pageloadfailed',
    'pageremove'
  ].forEach(function (name) {
    $(window).on(name, function (event) {
      logEvent(event, '$.mobile: ');
    });
  });

  [
    { context: $.mobile.navigate.history, name: 'add' }
  ].forEach(function (fn) {
    logFnDecorator(fn, '$.mobile.navigate.history.');
  });

  [
    { context: $.fn, name: 'animationComplete' }
  ].forEach(function (fn) {
    logFnDecorator(fn, '$.fn.');
  });

  [
    { context: $.mobile, name: '_bindPageRemove' },
    { context: $.mobile, name: '_handleHashChange' },
    { context: $.mobile, name: '_maybeDegradeTransition' },
    { context: $.mobile, name: '_registerInternalEvents' },
    { context: $.mobile, name: 'changePage' },
    { context: $.mobile, name: 'focusPage' },
    { context: $.mobile, name: 'hidePageLoadingMsg' },
    { context: $.mobile, name: 'loadPage' },
    { context: $.mobile, name: 'resetActivePageHeight' }
  ].forEach(function (fn) {
    logFnDecorator(fn, '$.mobile.');
  });

});
