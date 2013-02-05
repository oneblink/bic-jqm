/*
 * custom library to abstract access to available local storage mechanisms
 * requires: jQuery 1.5+, utilities.js (optional)
 * 
 * valid storage types are: localstorage, sessionstorage, websqldatabase, indexeddb
 * 
 * This has been designed with seemless operation of asynchronous storage methods,
 * via the jQuery Deferred Promises mechanism in jQuery 1.5.
 * 
 * The SQL-specific terms "database" and "table" have been replaced with
 * the more neutral "partition" and "section", respectively.
 */

/*jslint browser:true*/ // assume "window" and other browser globals
/*jslint plusplus:true, white:true*/
/*global define:true, require:true*/ // globals from require.JS

define(['logger', 'jQuery'], function(logger, $) {
	'use strict';
	var available,
	alert = window.alert,
	// for websqldatabase
	estimatedSize,
	webSqlDbs = {}, // store open handles to databases (websqldatabase)
	errorHandler,
	openSection,
	openWebSQL,
	/**
	 * @inner
	 * @construct
	 */
	BlinkStorage = function(type, partition, section) {
		var self = this,
			readyDeferred = new $.Deferred(),
			sql, // for webslqdatabase and blinkgapsql
			db, // for websqldatabase, localstorage or sessionstorage
			memory; // for memory
		if (typeof partition !== 'string' || partition.length < 1) {
			partition = 'default';
		}
		if (typeof section !== 'string' || section.length < 1) {
			section = 'main';
		}
		
		if (typeof type !== 'string') {
			type = available[0];
		} else if (type === 'sessionstorage' && $.inArray('sessionstorage', available) === -1) {
			type = 'memory';
		} else if ($.inArray(type, available) === -1) {
			type = available[0];
		}
		
		self.type = type;
		self.partition = partition;
		self.section = section;
		
		readyDeferred.done(function() {
			logger.log('BlinkStorage(): ' + type + ' -> ' + partition + ' : ' + section + ' ready');
		});
		self.ready = function() {
			return readyDeferred.promise();
		};
		
		if (type === 'localstorage' || type === 'sessionstorage') {

			db = (type === 'localstorage') ? window.localStorage : window.sessionStorage;

			self.get = function(key) {
				var dfrd = new $.Deferred();
				dfrd.resolve(db.getItem(partition + ':' + section + ':' + key));
				// dfrd.reject(); not sure if this is needed
				return dfrd.promise();
			};
			
			self.set = function(key, value) {
				var dfrd = new $.Deferred();
				db.setItem(partition + ':' + section + ':' + key, value);
				dfrd.resolve();
				return dfrd.promise();
			};
			
			self.remove = function(key) {
				var dfrd = new $.Deferred();
				db.removeItem(partition + ':' + section + ':' + key);
				dfrd.resolve();
				return dfrd.promise();
			};

			self.keys = function() {
				var dfrd = new $.Deferred(),
				found = [],
				length = db.length,
				index, parts,
				current,
				prefix = partition + ':' + section + ':';
				/* END: var */
				for (index = 0; index < length; index++) {
					current = db.key(index);
					if (current.indexOf(prefix) === 0) {
						found.push(current.replace(prefix, ''));
					}
				}
				dfrd.resolve(found);
				return dfrd.promise();
			};
			
			self.count = function() {
				var dfrd = new $.Deferred();
				$.when(self.keys()).done(function(keys) {
					dfrd.resolve(keys.length);
				});
				return dfrd.promise();
			};
			
			readyDeferred.resolve();

		} else if (type === 'websqldatabase') {
			
			estimatedSize = (window.device ? 5 : 0.75) * 1024 * 1024;
			/* @inner */
			errorHandler = function(arg1, arg2) {
				var sqlError = arg2 && arg1.executeSql ? arg2 : arg1;
				logger.error('BlinkStorage error1: ' + sqlError.code + ' ' + sqlError.message);
				if (sqlError.code === 3 || sqlError.code === 4 || sqlError.code === 7) {
					alert('storage-error: ' + sqlError.code + '\n' + sqlError.message);
				}
				return false;
			};
			/* @inner */
			openSection = function() {
				db.transaction(function(tx) {
					tx.executeSql(
						'CREATE TABLE IF NOT EXISTS `' + section + '` (k TEXT UNIQUE NOT NULL PRIMARY KEY, v TEXT NOT NULL)',
						[],
						readyDeferred.resolve,
						readyDeferred.reject
					);
				}, errorHandler, $.noop);
			};
			/* @inner */
			openWebSQL = function() {
				try {
					db = window.openDatabase(partition, '1.0', partition, estimatedSize);
					webSqlDbs[partition] = db;
					// fix for Android and others with incomplete WebSQL implementation
					db.readTransaction = db.readTransaction || db.transaction;
				} catch(error) {
					readyDeferred.reject();
					throw 'BlinkStorage: ' + error;
				}
			};
			
			// cache SQL so each string only occupies memory once per DB
			sql = {
				get: 'SELECT v FROM `' + section + '` WHERE k = ?',
				set: 'INSERT OR REPLACE INTO `' + section + '` (k, v) VALUES (?, ?)',
				remove: 'DELETE FROM `' + section + '` WHERE k = ?',
				keys: 'SELECT k FROM `' + section + '`',
				count: 'SELECT count(k) AS `count` FROM ' + section
			};
			
			if (webSqlDbs[partition]) {
				db = webSqlDbs[partition];
			} else {
				openWebSQL();
			}
			openSection();
			
			self.get = function(key) {
				var dfrd = new $.Deferred();
				db.readTransaction(function(tx) {
					tx.executeSql(sql.get, [ key ], 
						function(tx, result) { // SQL success handler
							if (result.rows.length === 1) {
								dfrd.resolve(result.rows.item(0).v);
							} else {
								dfrd.resolve(null);
								if (result.rows.length > 1) {
									logger.error('BlinkStorage: SELECT returned multiple rows');
								}
							}
						},
						errorHandler // SQL error handler
					);
				}, errorHandler, $.noop); // transaction handlers
				return dfrd.promise();
			};
			
			self.set = function(key, value, attempts) {
				var deferred = new $.Deferred(),
				dfrdSQL = new $.Deferred(),
				retryFn = function() {
					setTimeout(function() { // retry after 2 seconds
						$.when(self.set(key, value, attempts))
						.fail(deferred.reject)
						.then(deferred.resolve);
					}, 2 * 1000);
				};
				/* END: var */
				attempts = typeof attempts !== 'number' ? 2 : attempts;
				if (attempts-- <= 0) {
					deferred.reject();
					return deferred.promise();
				}
				// perform transaction
				setTimeout(function() {
					db.transaction(function(tx) {
						// execute INSERT OR REPLACE statement
						tx.executeSql(sql.set, [ key, value ], 
							function(tx, result) { // SQL success handler
								if (result.rowsAffected !== 1) {
									logger.error('BlinkStorage: INSERT did not affect 1 row');
									retryFn();
								} else {
									dfrdSQL.resolve();
								}
							},
							function(tx, sqlError) { // SQL error handler
								errorHandler(sqlError);
								retryFn();
							}
						);
					},
					function(tx, sqlError) { // transaction error handler
						errorHandler(tx, sqlError);
						retryFn();
					},
					function() { // transaction success handler
						if (dfrdSQL.state() === 'pending') {
							// if TX finishes before SQL then we have a problem
							retryFn();
						} else {
							deferred.resolve();
						}
					});
				}, 0);
				return deferred.promise();
			};
	
			self.remove = function(key) {
				var dfrd = new $.Deferred();
				db.transaction(function(tx) {
					tx.executeSql(sql.remove, [ key ], function(tx, result) {
						dfrd.resolve();
					});
				}, errorHandler, $.noop);
				return dfrd.promise();
			};

			self.keys = function() {
				var dfrd = new $.Deferred();
				db.readTransaction(function(tx) {
					tx.executeSql(sql.keys, [], function(tx, result) {
						var index, row,
							length = result.rows.length,
							found = [];
						for (index = 0; index < length; index++) {
							row = result.rows.item(index);
							found.push(row.k);
						}
						dfrd.resolve(found);
					});
				}, errorHandler, $.noop);
				return dfrd.promise();
			};
			
			self.count = function() {
				var dfrd = new $.Deferred();
				db.readTransaction(function(tx) {
					tx.executeSql(sql.count, [], function(tx, result) {
							var count = result.rows.item(0).count;
							if ($.isNumeric(count)) {
								dfrd.resolve(parseInt(count, 10));
							} else {
								logger.error('BlinkStorage: SELECT count(k) non-numeric');
								dfrd.reject();
							}
						}
					);
				}, errorHandler, $.noop);
				return dfrd.promise();
			};
			
		} else if (type === 'memory') {
			
			memory = {};

			self.get = function(key) {
				var dfrd = new $.Deferred();
				dfrd.resolve(memory[partition + ':' + section + ':' + key]);
				// dfrd.reject(); not sure if this is needed
				return dfrd.promise();
			};
			
			self.set = function(key, value) {
				var dfrd = new $.Deferred();
				memory[partition + ':' + section + ':' + key] = value;
				dfrd.resolve();
				return dfrd.promise();
			};
			
			self.remove = function(key) {
				var dfrd = new $.Deferred();
				delete memory[partition + ':' + section + ':' + key];
				dfrd.resolve();
				return dfrd.promise();
			};

			self.keys = function() {
				var dfrd = new $.Deferred(),
				found = [],
				prefix = partition + ':' + section + ':',
				key;
				/* END: var */
				for (key in memory) {
					if (memory.hasOwnProperty(key)) {
						if (key.indexOf(prefix) === 0) {
							found.push(key.replace(prefix, ''));
						}
					}
				}
				dfrd.resolve(found);
				return dfrd.promise();
			};
			
			self.count = function() {
				var dfrd = new $.Deferred();
				$.when(self.keys()).done(function(keys) {
					dfrd.resolve(keys.length);
				});
				return dfrd.promise();
			};
			
			readyDeferred.resolve();
		}
		return this;
	};
	/* END: var */
			
	BlinkStorage.prototype.removeKeysRegExp = function(regexp) {
		var store = this,
			deferred = new $.Deferred(function(dfrd) {
			$.when(store.keys()).done(function(keys) {
				var k, kLength = keys.length,
					removeDefers = [];
				for (k = 0; k < kLength; k++) {
					if (keys[k].search(regexp) !== -1) {
						removeDefers.push(store.remove(keys[k]));
					}
				}
				$.when(removeDefers).done(dfrd.resolve());
			});
		});
		return deferred.promise();
	};
	
	// perform engine detection
	BlinkStorage.prototype.available = [];
	available = BlinkStorage.prototype.available;
	// TODO: add detection for indexedDB
	if (typeof window.openDatabase !== 'undefined') {
		available.push('websqldatabase');
	}
	if (typeof window.localStorage !== 'undefined') {
		available.push('localstorage');
	}
	if (typeof window.sessionStorage !== 'undefined') {
		available.push('sessionstorage');
	}
	available.push('memory');
	if (typeof window.log === 'function') {
		logger.info('BlinkStorage(): available=[' + available.join(',') + ']');
	}
	
	return BlinkStorage;
});
