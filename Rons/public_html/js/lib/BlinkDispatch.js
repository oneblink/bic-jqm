/* 
 * basic class for queuing execution
 */

/*jslint browser:true*/ // assume "window" and other browser globals
/*jslint white:true*/ // ignore white-space issues
/*global define:true, require:true*/ // globals from require.JS

define(['jQuery'], function($) {
  'use strict';
	var BlinkDispatch = function(interval) {
		var timeout = null,
		self = this; // to facilitate self-references
		/* END: var */
		this.queue = [];
		this.interval = interval || 0;
		this.isPaused = false;
		
		/**
		 * check to see if we have items in the queue, and process the first one
		 */
		function processQueue() {
			if (self.isPaused || timeout !== null || self.queue.length === 0) {return;}
			var item = self.queue.shift(),
			result;
			/* END: var */
			if (typeof item === 'function') {
				result = item();
			}
			// check to see if we have queued a jQuery Deferred Promise
			if (typeof $ === 'function' && $() instanceof $
					&& result && $.isPromise(result)) {
				timeout = 0; // placeholder value
				$.when(result)
				.always(function() {
					timeout = setTimeout(function() {
						timeout = null;
						processQueue();
					}, self.interval);
				});
			} else { // not a Promise
				timeout = setTimeout(function() {
					timeout = null;
					processQueue();
				}, self.interval);
			}
		}
		/**
		 * public function to trigger processing of the queue
		 */
		this.poke = function() {
			processQueue();
		};
		this.pause = function() {
			clearTimeout(timeout);
			timeout = null;
			this.isPaused = true;
		};
		this.resume = function() {
			this.isPaused = false;
			processQueue();
		};
		return this;
	};
	/* END: var */
  
	BlinkDispatch.prototype.add = function(item) {
		this.queue.push(item);
		this.poke();
	};
  
  return BlinkDispatch;
});
