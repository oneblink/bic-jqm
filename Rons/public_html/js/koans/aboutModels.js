/*jslint browser:true*/ // assume "window" and other browser globals
/*jslint white:true*/ // ignore white-space issues
/*jslint sloppy:true*/ // ignore 'use strict' ES5 requirement

/*global define:true, require:true*/ // globals from Require.JS

/*global equal:true, expect:true, module:true, ok:true, test:true*/ // QUnit
/*global notEqual:true*/ // QUnit

require(['models/answerSpace'], function(AnswerSpace) {

  module('about Backbone.Model answerSpace');

  test('can be created with default values for its attributes', function() {
    expect(1);
    var answerSpace = new AnswerSpace();
    equal(answerSpace.get('id'), null);
  });
  
  test('constructor parameters are set on the model instance', function() {
    expect(2);
    var answerSpace = new AnswerSpace({
      id: 123, 
      name: 'test'
    });
    equal(answerSpace.get('id'), 123);
    equal(answerSpace.get('name'), 'test');
  });
  
  test('fires a custom event when the state changes', function() {
    var spy = this.spy(),
    answerSpace = new AnswerSpace();
    /* END: var */
    expect(1);
    answerSpace.on('change', spy);
    answerSpace.set('id', 456);
    ok(spy.calledOnce, 'a change event callback was correctly triggered');
  });
  
  test('defines validation rules, failures trigger an event', function() {
    var onError = this.spy(),
    answerSpace = new AnswerSpace(),
    call;
    /* END: var */
    expect(3);
    answerSpace.on('error', onError);
    answerSpace.set('id', 'abc'); // id must be a positive integer
    ok(onError.called, 'failed validation triggered the error handler');
    call = onError.getCall(0);
    notEqual(call, undefined, 'error handler called at least once');
    equal(call.args[1], 'id must be a positive integer', 'threw correct error');
  });
  
  return true;
  
});
