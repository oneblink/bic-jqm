/*jslint browser:true*/ // assume "window" and other browser globals
/*jslint white:true*/ // ignore white-space issues
/*jslint sloppy:true*/ // ignore 'use strict' ES5 requirement

/*global define:true, require:true*/ // globals from Require.JS

/*global equal:true, expect:true, module:true, ok:true, test:true*/ // QUnit

define(['jQuery'], function($) {

  module('about Library jQuery', {
    setup: function() {
      $('body').append('<span id="qunit-attr-test" data-test="$.attr"></span>');
    },
    teardown: function() {
      $('#qunit-attr-test').remove();
    }
  });
  
  test('loaded and initialised successfully', function() {
    expect(3);
    equal(typeof $ !== 'undefined', true, '$ is not undefined');
    equal(typeof $, 'function', '$ is a function');
    equal($('body').length, 1, '$("body") find 1 <body> element');
  });
  
  test('$.isObject() works as expected', function() {
    expect(8);
    equal(typeof $.isObject, 'function', '$.isObject is a function');
    equal($.isObject(123), false, '123 is not an object');
    equal($.isObject('abc'), false, '"abc" is not an object');
    equal($.isObject($.isObject), false, 'the function is not an object');
    equal($.isObject([1, 2, 3]), false, 'an array is not an object');
    equal($.isObject({}), true, 'a brand new Object is an object');
    equal($.isObject($('body')), true, 'a jQuery selector is an object');
    equal($.isObject(new $.Deferred()), true, 'new $.Deferred is an object');
  });
  
  test('$.isDeferred() works as expected', function() {
    var deferred = new $.Deferred(),
    promise = deferred.promise();

    expect(9);
    equal(typeof $.isDeferred, 'function', '$.isDeferred is a function');
    equal($.isDeferred(123), false, '123 is not a Deferred');
    equal($.isDeferred('abc'), false, '"abc" is not a Deferred');
    equal($.isDeferred($.isDeferred), false, 'the function is not a Deferred');
    equal($.isDeferred([1, 2, 3]), false, 'an array is not a Deferred');
    equal($.isDeferred({}), false, 'a brand new Object is a Deferred');
    equal($.isDeferred($('body')), false, 'a jQuery selector is not a Deferred');
    equal($.isDeferred(deferred), true, 'new $.Deferred is a Deferred');
    equal($.isDeferred(promise), false, 'a new Promise is not a Deferred');
  });
  
  test('$.isPromise() works as expected', function() {
    var deferred = new $.Deferred(),
    promise = deferred.promise();

    expect(9);
    equal(typeof $.isPromise, 'function', '$.isPromise is a function');
    equal($.isPromise(123), false, '123 is not a Promise');
    equal($.isPromise('abc'), false, '"abc" is not a Promise');
    equal($.isPromise($.isPromise), false, 'the function is not a Promise');
    equal($.isPromise([1, 2, 3]), false, 'an array is not a Promise');
    equal($.isPromise({}), false, 'a brand new Object is a Promise');
    equal($.isPromise($('body')), false, 'a jQuery selector is not a Promise');
    equal($.isPromise(deferred), true, 'new $.Deferred is a Promise');
    equal($.isPromise(promise), true, 'a new Promise is a Promise');
  });
  
  test('$.fn.attr() duck-punch works as expected', function() {
    var $test = $('#qunit-attr-test'),
    map;
    /* END: var */
    expect(10);
    equal(typeof $.attr, 'function', '$.fn.attr is a function');
    map = $test.attr();
    equal(typeof map !== 'undefined', true, 'map is not undefined');
    equal($.isObject(map), true, 'map is an object');
    equal($.isPlainObject(map), true, 'map is a plain object');
    equal(map.id, 'qunit-attr-test', '@id contained in map');
    equal($test.attr('id'), 'qunit-attr-test', '@id retrieved directly');    
    equal(map['data-test'], '$.attr', '@data-test contained in map');
    equal($test.attr('data-test'), '$.attr', '@data-test retrieved directly');
    $test.attr('data-test', '123');
    map = $test.attr();
    equal(map['data-test'], '123', 'new @data-test contained in map');
    equal($test.attr('data-test'), '123', 'new @data-test retrieved directly');
  });
  
  // TODO: need tests for $.fn.tag
  // TODO: need tests for $.fn.tagHTML
  // TODO: need tests for $.whenArray
  // TODO: need tests for $.resolveTimeout
  // TODO: need tests for $.fn.appendWithCheck
  
  return true;
});
