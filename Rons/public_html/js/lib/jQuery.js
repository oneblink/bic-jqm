/*jslint browser:true*/ // assume "window" and other browser globals
/*jslint white:true*/ // ignore white-space issues
/*global define:true, require:true*/ // globals from require.JS

/*jslint nomen:true, plusplus:true*/

define(['jquery'], function($) {
  'use strict';
  var _oldAttr = $.fn.attr;
  /* END: var */

  /**
   * checks to see if an Object has the listed Properties
   * didn't feel comfortable exposing this to the world
   * really handy for duck-typing (does it quack like a duck?)
   * @param {Object} object object to check.
   * @param {Object|Array} props array of properties, or map of property->type.
   * @return {Boolean} all properties present?
   */
  function hasProperties(object, props) {
    var result = true;
    if (!object || $.type(object) !== 'object') {
      return false;
    }
    if ($.type(props) === 'array') {
      $.each(props, function(index, name) {
        if (typeof object[name] === 'undefined') {
          result = false;
          return false; // break loop now
        }
        return true; // continue testing
      });
      return result;
    }
    if ($.type(props) === 'object') {
      $.each(props, function(name, value) {
        if ($.type(object[name]) !== value) {
          result = false;
          return false; // break loop now
        }
        return true; // continue testing
      });
      return result;
    }
    return false;
  }

  // set jQuery Mobile's configuration here (before it loads)
  $(window.document).one('mobileinit', function() {
    // set page load error message
    $.mobile.pageLoadErrorMessage = 'Error Loading Page';
    // disable jQuery Mobile's default routing so we can use Backbone's instead
    // remember that we'll have to call $.mobile.changePage manually from now on
    $.mobile.ajaxEnabled = false;
    $.mobile.hashListeningEnabled = false;
    //    $.mobile.linkBindingEnabled = false;
    $.mobile.pushStateEnabled = false;
  });

  /**
   * @param {Object} Does $.type(object) === 'object'?
   */
  $.isObject = function(variable) {
    return $.type(variable) === 'object';
  };

  /**
   * @return {Boolean} Is object a jQuery Deferred Promise (read-only)?
   */
  $.isPromise = function(object) {
    var type = 'function',
        props = {
          always: type,
          done: type,
          fail: type,
          pipe: type,
          progress: type,
          promise: type,
          state: type,
          then: type
        };
    return hasProperties(object, props);
  };

  /**
   * @return {Boolean} Is object a jQuery Deferred Object (read-write)?
   */
  $.isDeferred = function(object) {
    var type = 'function',
        props = {
          notify: type,
          notifyWith: type,
          reject: type,
          rejectWith: type,
          resolve: type,
          resolveWith: type
        };
    if ($.isPromise(object)) {
      return hasProperties(object, props);
    }
    return false;
  };

  // duck-punching to make attr() return a map
  $.fn.attr = function() {
    var a, aLength, attributes, map;
    if (this[0] && arguments.length === 0) {
      map = {};
      attributes = this[0].attributes;
      aLength = attributes.length;
      $.each(attributes, function(index, attribute) {
        var name = attribute.name || attribute.nodeName,
            value = attribute.value || attribute.nodeValue;
        /* END: var */
        if (name) {
          map[name.toLowerCase()] = value;
        }
      });
      return map;
    }
    return _oldAttr.apply(this, arguments);
  };

  // return just the element's HTML tag (no attributes or innerHTML)
  $.fn.tag = function() {
    var tag;
    if (this.length > 0) {
      tag = this[0].nodeName || this[0].tagName || '';
      return tag.toLowerCase();
    }
    return '';
  };

  // return a simple HTML tag string not containing the innerHTML
  $.fn.tagHTML = function() {
    var $this = $(this),
        html;
    if (this[0]) {
      html = '<' + $this.tag();
      $.each($this.attr(), function(key, value) {
        html += ' ' + key + '="' + value + '"';
      });
      html += ' />';
      return html;
    }
    return null;
  };

  /* function to allow passing an array to jQuery.when() */
  $.whenArray = function(array) {
    return $.when.apply($, array);
  };

  /** automatically wrap Deferred.resolve in a setTimeout
   */
  $.resolveTimeout = function() {
    var args = $.makeArray(arguments),
        deferred = args.shift();
    setTimeout(function() {
      deferred.resolve.apply(deferred, args);
    }, 0);
    return this;
  };

  /**
   * @param {String} string the (X)HTML or text to append to the selected element.
   * @param {Number} attempts number of times to try.
   * @param {String} [needle] resulting HTML must include this for success.
   * @param {Number} [lastIndex] only used internally.
   * @return {jQueryPromise}
   */
  $.fn.appendWithCheck = function(string, attempts, needle, lastIndex) {
    var $element = $(this),
        deferred = new $.Deferred(),
        MyAnswers = window.MyAnswers;
    /* END: var */
    if ($.type(needle) !== 'string') {
      /*jslint regexp: true*/
      needle = string.match(/>([^<>\0\n\f\r\t\v]+)</);
      /*jslint regexp: false*/
      if (!needle) {
        needle = string.match(/(\w+)/);
      }
      needle = $.type(needle) === 'array' ? needle[0] : string;
    }
    if ($.type(lastIndex) !== 'number') {
      lastIndex = $element.html().lastIndexOf(needle);
    }
    setTimeout(function() {
      $element.append(string);
      setTimeout(function() {
        var html = $element.html();
        if ($.type(html) !== 'string' || html.length === 0 || html.lastIndexOf(needle) > lastIndex) {
          deferred.resolve();
        } else if (attempts > 0) {
          $.when($element.appendWithCheck(string, --attempts, needle, lastIndex))
          .fail(deferred.reject)
          .then(deferred.resolve);
        } else {
          deferred.reject();
        }
      }, 47);
    }, 47);
    return deferred.promise();
  };

  /*!
  * jQuery BBQ: Back Button & Query Library - v1.2.1 - 2/17/2010
  * http://benalman.com/projects/jquery-bbq-plugin/
  *
  * Copyright (c) 2010 "Cowboy" Ben Alman
  * Dual licensed under the MIT and GPL licenses.
  * http://benalman.com/about/license/
  */
  $.deparam = function(params, coerce) {
    var obj = {},
        coerce_types = { 'true': !0, 'false': !1, 'null': null };

    // Iterate over all name=value pairs.
    $.each(params.replace(/\+/g, ' ').split('&'), function(j, v) {
      var param = v.split('='),
          key = decode(param[0]),
          val,
          cur = obj,
          i = 0,

          // If key is more complex than 'foo', like 'a[]' or 'a[b][c]',
          // split it into its component parts.
          keys = key.split(']['),
          keys_last = keys.length - 1;

      // If the first keys part contains [ and the last ends with ], then []
      // are correctly balanced.
      if (/\[/.test(keys[0]) && /\]$/.test(keys[keys_last])) {
        // Remove the trailing ] from the last keys part.
        keys[keys_last] = keys[keys_last].replace(/\]$/, '');

        // Split first keys part into two parts on the [ and add them back onto
        // the beginning of the keys array.
        keys = keys.shift().split('[').concat(keys);

        keys_last = keys.length - 1;
      } else {
        // Basic 'foo' style key.
        keys_last = 0;
      }

      // Are we dealing with a name=value pair, or just a name?
      if (param.length === 2) {
        val = decode(param[1]);

        // Coerce values.
        if (coerce) {
          val = val && !isNaN(val) ? +val              // number
            : val === 'undefined' ? undefined         // undefined
            : coerce_types[val] !== undefined ? coerce_types[val] // true, false, null
            : val;                                                // string
        }

        if (keys_last) {
          // Complex key, build deep object structure based on a few rules:
          // * The 'cur' pointer starts at the object top-level.
          // * [] = array push (n is set to array length), [n] = array if n is
          //   numeric, otherwise object.
          // * If at the last keys part, set the value.
          // * For each keys part, if the current level is undefined create an
          //   object or array based on the type of the next keys part.
          // * Move the 'cur' pointer to the next level.
          // * Rinse & repeat.
          for (; i <= keys_last; i++) {
            key = keys[i] === '' ? cur.length : keys[i];
            cur = cur[key] = i < keys_last
              ? cur[key] || (keys[i + 1] && isNaN(keys[i + 1]) ? {} : [])
              : val;
          }

        } else {
          // Simple key, even simpler rules, since only scalars and shallow
          // arrays are allowed.

          if ($.isArray(obj[key])) {
            // val is already an array, so push on the next value.
            obj[key].push(val);

          } else if (obj[key] !== undefined) {
            // val isn't an array, but since a second value has been specified,
            // convert val into an array.
            obj[key] = [obj[key], val];

          } else {
            // val is a scalar.
            obj[key] = val;
          }
        }

      } else if (key) {
        // No value was defined, so set something meaningful.
        obj[key] = coerce
          ? undefined
          : '';
      }
    });

    return obj;
  };

  return window.$;
});
