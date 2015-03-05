(function () {
  
  var cloudfront, filesystem, rootPath, paths, getPaths, scripts, s, script,
    supportsBundles, versionMatches;

  cloudfront = '//d1c6dfkb81l78v.cloudfront.net/';
  filesystem = '/_c_/';

  if (!document.currentScript) {
    scripts = document.getElementsByTagName('script');
    document.currentScript = scripts[scripts.length - 1];
  }
  if (window.BICURL) {
    rootPath = window.BICURL.replace(/\\/g, '/').replace(/\/[^\/]*$/, '');
  } else {
    rootPath = document.currentScript.src.replace(/\\/g, '/').replace(/\/[^\/]*$/, '');
  }

  // determine our current CDN based on how we referenced Require.JS
  scripts = document.getElementsByTagName('script');
  s = scripts.length;
  while (s > 0) {
    s -= 1;
    script = scripts[s];
    if (script.src && /\/blink\/require\/\d+\/require\.min\.js/.test(script.src)) {
      cloudfront = script.src.replace(/blink\/require\/\d+\/require\.min\.js[\w\.]*$/, '');
      break; // exit early
    }
  }

  if (location.protocol === 'file:') {
    cloudfront = cloudfront.replace(/^\/\//, 'https://');
  }

  getPaths = function (path) {
    var result;
    result = [
      cloudfront + path,
      filesystem + path
    ];
    return result;
  };

  // dynamically set paths and fall-back paths;
  paths = {
    BlinkForms: getPaths('blink/forms/3/3.1.8/forms3jqm.min'),
    'BMP.Blobs': getPaths('blink/blobs/1377493706402/bmp-blobs.min'),
    signaturepad: getPaths('signaturepad/2.3.0/jq.sig.min'),
    jquerymobile: getPaths('jquery.mobile/1.3.2/jquery.mobile-1.3.2.min'),
    jquery: getPaths('jquery/1.9.1/jquery.min'),
    bluebird: getPaths('bluebird/1.2.4/bluebird.min'),
    backbone: getPaths('backbonejs/1.1.2/backbone-min'),
    lodash: getPaths('lodash/2.4.1/lodash.compat.min'),
    modernizr: getPaths('modernizr/2.7.1/modernizr.custom.26204.min'),
    mustache: getPaths('mustache/0.7.3/mustache.min'),
    q: getPaths('q/0.9.7/q.min'),
    underscore: getPaths('lodash/2.4.1/lodash.underscore.min'),
    'es5-shim': getPaths('es5-shim/2.3.0/es5-shim.min'),
    pouchdb: getPaths('pouchdb/3.2.1/pouchdb-3.2.1.min')
  };

  require.config({ paths: paths });
}());

require.config({
  shim: {
    'BMP.Blobs': {
      deps: ['underscore', 'jquery'],
      exports: 'BMP'
    },
    'signaturepad': {
      deps: ['jquery'],
      exports: '$'
    },
    backbone: {
      deps: ['underscore', 'jquery'],
      exports: 'Backbone'
    },
    modernizr: {
      exports: 'Modernizr'
    },
    underscore: {
      exports: '_'
    },
    sjcl: {
      exports: 'sjcl'
    }
  }
});

define('implementations', [], function () {
  
  return {
    'es5': [
      {
        isAvailable: function () {
          // https://github.com/Modernizr/Modernizr/blob/master/feature-detects/es5/array.js
          return !(Array.prototype &&
            Array.prototype.every &&
            Array.prototype.filter &&
            Array.prototype.forEach &&
            Array.prototype.indexOf &&
            Array.prototype.lastIndexOf &&
            Array.prototype.map &&
            Array.prototype.some &&
            Array.prototype.reduce &&
            Array.prototype.reduceRight &&
            Array.isArray &&
            Function.prototype.bind);
        },
        implementation: 'es5-shim'
      },
      {
        isAvailable: function () { return true; },
        module: function () {
          return {};
        }
      }
    ],
    promises: [
      {
        // native ES6 Promises
        isAvailable: function () {
          // https://github.com/Modernizr/Modernizr/blob/master/feature-detects/es6/promises.js
          return 'Promise' in window &&
            'resolve' in window.Promise &&
            'reject' in window.Promise &&
            'all' in window.Promise &&
            'race' in window.Promise &&
            (function() {
              var resolve;
              new window.Promise(function(r) { resolve = r; });
              return typeof resolve === 'function';
            }());
        },
        module: function () {
          return Promise;
        }
      },
      {
        // fallback to Bluebird
        isAvailable: function () { return true; },
        implementation: 'bluebird'
      }
    ]
  };
});

/**
 * AMD-Feature - A loader plugin for AMD loaders.
 * 
 * https://github.com/jensarps/AMD-feature
 *
 * @author Jens Arps - http://jensarps.de/
 * @license MIT or BSD - https://github.com/jensarps/AMD-feature/blob/master/LICENSE
 * @version 1.1.0
 */
define('feature',['implementations'], function (implementations) {

  return {

    load: function (name, req, load, config) {

      var i, m, toLoad,
          featureInfo = implementations[name],
          hasMultipleImpls = Object.prototype.toString.call(featureInfo) == '[object Array]';

      if (config.isBuild && hasMultipleImpls) {
        // In build context, we want all possible
        // implementations included.
        for (i = 0, m = featureInfo.length; i < m; i++) {
          if (featureInfo[i].implementation) {
            req([featureInfo[i].implementation], load);
          }
        }

        // We're done here now.
        return;
      }

      if (hasMultipleImpls) {
        // We have different implementations available,
        // test for the one to use.
        for (i = 0, m = featureInfo.length; i < m; i++) {
          var current = featureInfo[i];
          if (current.isAvailable()) {
            if (typeof current.module != 'undefined') {
              load(current.module());
              return;
            }
            toLoad = current.implementation;
            break;
          }
        }
      } else {
        if (typeof featureInfo.module != 'undefined') {
          load(featureInfo.module());
          return;
        }
        toLoad = featureInfo;
      }

      req([toLoad], load);
    }
  };
});

// https://github.com/umdjs/umd/blob/master/returnExports.js
(function (root, factory) {
  
  if (typeof define === 'function' && define.amd) {
    define('pollUntil',[], factory);
  } else if (typeof exports === 'object') {
    module.exports = factory();
  } else {
    root.pollUntil = factory();
  }
}(this, function () {
  
  // https://gist.github.com/jokeyrhyme/9753904
  /**
   * @param {Function} condition a function that returns `true` or `false`
   * @param {Number} [interval=197] the amount of time to wait between tests
   * @param {Function} callback a function to invoke when the condition returns `true`
   * @returns {Function} call this to stop early (but no earlier than first check)
   */
  return function pollUntil(condition, interval, callback) {
    var timeout;
    if (condition && condition()) {
      timeout = null;
      callback();
    } else {
      timeout =  setTimeout(function () {
        pollUntil(condition, interval, callback);
      }, interval || 197);
    }
    return function stop() {
      clearTimeout(timeout);
    };
  };
}));

(function () {
  
  var BMP;

  BMP = window.BMP;

  BMP.BlinkGap = {};

  // detect BlinkGap / PhoneGap / Callback
  BMP.BlinkGap.isHere = function () {
    if (window.isBlinkGap || window.cordova) {
      return true;
    }
    if (BMP.BIC && BMP.BIC.isBlinkGap) {
      return true;
    }
    return !!(
      window.PhoneGap &&
      $.type(window.device) === 'object' &&
      window.device instanceof window.Device
    );
  };

  BMP.BlinkGap.isReady = function () {
    return BMP.BlinkGap.isHere() && !!(
      (window.PhoneGap && window.PhoneGap.available) ||
      (window.cordova && window.cordova.available)
    );
  };

  BMP.BlinkGap.hasCamera = function () {
    return BMP.BlinkGap.isHere() && !!(
      (window.Camera && window.Camera.getPicture) ||
      (navigator.camera && navigator.camera.getPicture)
    );
  };

  BMP.BlinkGap.hasTouchDraw = function () {
    return BMP.BlinkGap.isHere() && !!(
      (window.BGTouchDraw && window.BGTouchDraw.getDrawing) ||
      (navigator.bgtouchdraw && navigator.bgtouchdraw.getDrawing)
    );
  };

  BMP.BlinkGap.hasOffline = function () {
    return !!(
      BMP.BlinkGap.isHere() &&
      window.cordova &&
      window.cordova.offline
    );
  };

  BMP.BlinkGap.isOfflineReady = function () {
    return !!(
      BMP.BlinkGap.isReady() &&
      BMP.BlinkGap.hasOffline() &&
      window.cordova.offline.available
    );
  };

  BMP.BlinkGap.waitForOffline = function (onSuccess, onError) {
    var stopPolling, timeout;
    timeout = setTimeout(function () {
      if (!BMP.BlinkGap.isOfflineReady() && stopPolling) {
        stopPolling();
        onError(new Error('no cordova.offline.available after 5 seconds'));
      }
    }, 5e3);
    stopPolling = pollUntil(BMP.BlinkGap.isOfflineReady, 197, function () {
      clearTimeout(timeout);
      onSuccess();
    });
  };

  /**
   * @return {jQueryPromise}
   */
  BMP.BlinkGap.whenReady = function () {
    var dfrd, start, checkFn, readyHandler;

    dfrd = new $.Deferred();
    start = new Date();

    readyHandler = function () {
      document.removeEventListener('deviceready', readyHandler, false);
      dfrd.resolve();
    };

    checkFn = function () {
      if (BMP.BlinkGap.isHere()) {
        if (BMP.BlinkGap.isReady()) {
          dfrd.resolve();
        } else if (document.addEventListener) {
          document.addEventListener('deviceready', readyHandler, false);
        }
      } else if (($.now() - start) > 10 * 1000) {
        dfrd.reject(new Error('waitForBlinkGap(): still no PhoneGap after 10 seconds'));
      } else {
        setTimeout(checkFn, 197);
      }
    };

    checkFn();

    return dfrd.promise();
  };

}());

(function () {
  

  if (!BMP.BlinkGap.hasOffline()) {
    return; // don't bother with this
  }

  function getInitialOrigin() {
    var match;
    if (!BMP.BlinkGap.hasOffline()) {
      throw new Error('no offline cordova plugin');
    }
    if (!cordova.offline.initialURL || typeof cordova.offline.initialURL !== 'string') {
      throw new Error('offline cordova plugin did not supply initialURL');
    }
    match = cordova.offline.initialURL.match(/(https?:\/\/[^\/]+)/);
    if (!match) {
      throw new Error('initialURL was malformed and could not be parsed');
    }
    return match[1];
  }

  /**
   * @class wrapper to facilitate more convenient use of cordova.offline
   */
  function BGOffline() {
    this.plugin = window.cordova.offline;
    this.urlsMap = {};
    return this;
  }

  BGOffline.prototype.populateURLsMap = function (onSuccess, onError) {
    var me = this;
    BMP.BlinkGap.waitForOffline(function () {
      me.plugin.listResources(function (list) {
        me.urlsMap = list;
        onSuccess();
      }, function (err) {
        onError(err);
      });
    }, function (err) {
      onError(err);
    });
  };

  BGOffline.prototype.getURL = function (onlineURL) {
    var offlineURL;
    offlineURL = this.urlsMap[onlineURL];
    if (onlineURL.indexOf('//') === 0) {
      if (!offlineURL) {
        offlineURL = this.urlsMap['https:' + onlineURL];
      }
      if (!offlineURL) {
        offlineURL = this.urlsMap['http:' + onlineURL];
      }
    } else if (onlineURL.indexOf('/') === 0) {
      onlineURL = getInitialOrigin() + onlineURL;
      offlineURL = this.urlsMap[onlineURL];
    }
    return offlineURL;
  };

  BMP.BlinkGap.offline = new BGOffline();
}());

define("BlinkGap", ["pollUntil"], (function (global) {
    return function () {
        var ret, fn;
        return ret || global.BMP.BlinkGap;
    };
}(this)));


// Begin!
(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        define('bic', [
            'feature!promises',
            'jquery',
            'underscore',
            'backbone',
            'mustache',
            'BlinkForms',
            'jquerymobile',
            'BMP.Blobs',
            'modernizr',
            'pouchdb',
            'pollUntil',
            'feature!es5',
            'BlinkGap'
        ], factory);
    } else {
        root.bic = factory();
    }
}(this, function (Promise, $, _, Backbone, Mustache, BlinkForms, jquerymobile, BMP, Modernizr, Pouch, pollUntil) {
  window.pollUntil = pollUntil;
/**
 * @license almond 0.2.9 Copyright (c) 2011-2014, The Dojo Foundation All Rights Reserved.
 * Available via the MIT or new BSD license.
 * see: http://github.com/jrburke/almond for details
 */
//Going sloppy to avoid 'use strict' string cost, but strict practices should
//be followed.
/*jslint sloppy: true */
/*global setTimeout: false */

var requirejs, require, define;
(function (undef) {
    var main, req, makeMap, handlers,
        defined = {},
        waiting = {},
        config = {},
        defining = {},
        hasOwn = Object.prototype.hasOwnProperty,
        aps = [].slice,
        jsSuffixRegExp = /\.js$/;

    function hasProp(obj, prop) {
        return hasOwn.call(obj, prop);
    }

    /**
     * Given a relative module name, like ./something, normalize it to
     * a real name that can be mapped to a path.
     * @param {String} name the relative name
     * @param {String} baseName a real name that the name arg is relative
     * to.
     * @returns {String} normalized name
     */
    function normalize(name, baseName) {
        var nameParts, nameSegment, mapValue, foundMap, lastIndex,
            foundI, foundStarMap, starI, i, j, part,
            baseParts = baseName && baseName.split("/"),
            map = config.map,
            starMap = (map && map['*']) || {};

        //Adjust any relative paths.
        if (name && name.charAt(0) === ".") {
            //If have a base name, try to normalize against it,
            //otherwise, assume it is a top-level require that will
            //be relative to baseUrl in the end.
            if (baseName) {
                //Convert baseName to array, and lop off the last part,
                //so that . matches that "directory" and not name of the baseName's
                //module. For instance, baseName of "one/two/three", maps to
                //"one/two/three.js", but we want the directory, "one/two" for
                //this normalization.
                baseParts = baseParts.slice(0, baseParts.length - 1);
                name = name.split('/');
                lastIndex = name.length - 1;

                // Node .js allowance:
                if (config.nodeIdCompat && jsSuffixRegExp.test(name[lastIndex])) {
                    name[lastIndex] = name[lastIndex].replace(jsSuffixRegExp, '');
                }

                name = baseParts.concat(name);

                //start trimDots
                for (i = 0; i < name.length; i += 1) {
                    part = name[i];
                    if (part === ".") {
                        name.splice(i, 1);
                        i -= 1;
                    } else if (part === "..") {
                        if (i === 1 && (name[2] === '..' || name[0] === '..')) {
                            //End of the line. Keep at least one non-dot
                            //path segment at the front so it can be mapped
                            //correctly to disk. Otherwise, there is likely
                            //no path mapping for a path starting with '..'.
                            //This can still fail, but catches the most reasonable
                            //uses of ..
                            break;
                        } else if (i > 0) {
                            name.splice(i - 1, 2);
                            i -= 2;
                        }
                    }
                }
                //end trimDots

                name = name.join("/");
            } else if (name.indexOf('./') === 0) {
                // No baseName, so this is ID is resolved relative
                // to baseUrl, pull off the leading dot.
                name = name.substring(2);
            }
        }

        //Apply map config if available.
        if ((baseParts || starMap) && map) {
            nameParts = name.split('/');

            for (i = nameParts.length; i > 0; i -= 1) {
                nameSegment = nameParts.slice(0, i).join("/");

                if (baseParts) {
                    //Find the longest baseName segment match in the config.
                    //So, do joins on the biggest to smallest lengths of baseParts.
                    for (j = baseParts.length; j > 0; j -= 1) {
                        mapValue = map[baseParts.slice(0, j).join('/')];

                        //baseName segment has  config, find if it has one for
                        //this name.
                        if (mapValue) {
                            mapValue = mapValue[nameSegment];
                            if (mapValue) {
                                //Match, update name to the new value.
                                foundMap = mapValue;
                                foundI = i;
                                break;
                            }
                        }
                    }
                }

                if (foundMap) {
                    break;
                }

                //Check for a star map match, but just hold on to it,
                //if there is a shorter segment match later in a matching
                //config, then favor over this star map.
                if (!foundStarMap && starMap && starMap[nameSegment]) {
                    foundStarMap = starMap[nameSegment];
                    starI = i;
                }
            }

            if (!foundMap && foundStarMap) {
                foundMap = foundStarMap;
                foundI = starI;
            }

            if (foundMap) {
                nameParts.splice(0, foundI, foundMap);
                name = nameParts.join('/');
            }
        }

        return name;
    }

    function makeRequire(relName, forceSync) {
        return function () {
            //A version of a require function that passes a moduleName
            //value for items that may need to
            //look up paths relative to the moduleName
            return req.apply(undef, aps.call(arguments, 0).concat([relName, forceSync]));
        };
    }

    function makeNormalize(relName) {
        return function (name) {
            return normalize(name, relName);
        };
    }

    function makeLoad(depName) {
        return function (value) {
            defined[depName] = value;
        };
    }

    function callDep(name) {
        if (hasProp(waiting, name)) {
            var args = waiting[name];
            delete waiting[name];
            defining[name] = true;
            main.apply(undef, args);
        }

        if (!hasProp(defined, name) && !hasProp(defining, name)) {
            throw new Error('No ' + name);
        }
        return defined[name];
    }

    //Turns a plugin!resource to [plugin, resource]
    //with the plugin being undefined if the name
    //did not have a plugin prefix.
    function splitPrefix(name) {
        var prefix,
            index = name ? name.indexOf('!') : -1;
        if (index > -1) {
            prefix = name.substring(0, index);
            name = name.substring(index + 1, name.length);
        }
        return [prefix, name];
    }

    /**
     * Makes a name map, normalizing the name, and using a plugin
     * for normalization if necessary. Grabs a ref to plugin
     * too, as an optimization.
     */
    makeMap = function (name, relName) {
        var plugin,
            parts = splitPrefix(name),
            prefix = parts[0];

        name = parts[1];

        if (prefix) {
            prefix = normalize(prefix, relName);
            plugin = callDep(prefix);
        }

        //Normalize according
        if (prefix) {
            if (plugin && plugin.normalize) {
                name = plugin.normalize(name, makeNormalize(relName));
            } else {
                name = normalize(name, relName);
            }
        } else {
            name = normalize(name, relName);
            parts = splitPrefix(name);
            prefix = parts[0];
            name = parts[1];
            if (prefix) {
                plugin = callDep(prefix);
            }
        }

        //Using ridiculous property names for space reasons
        return {
            f: prefix ? prefix + '!' + name : name, //fullName
            n: name,
            pr: prefix,
            p: plugin
        };
    };

    function makeConfig(name) {
        return function () {
            return (config && config.config && config.config[name]) || {};
        };
    }

    handlers = {
        require: function (name) {
            return makeRequire(name);
        },
        exports: function (name) {
            var e = defined[name];
            if (typeof e !== 'undefined') {
                return e;
            } else {
                return (defined[name] = {});
            }
        },
        module: function (name) {
            return {
                id: name,
                uri: '',
                exports: defined[name],
                config: makeConfig(name)
            };
        }
    };

    main = function (name, deps, callback, relName) {
        var cjsModule, depName, ret, map, i,
            args = [],
            callbackType = typeof callback,
            usingExports;

        //Use name if no relName
        relName = relName || name;

        //Call the callback to define the module, if necessary.
        if (callbackType === 'undefined' || callbackType === 'function') {
            //Pull out the defined dependencies and pass the ordered
            //values to the callback.
            //Default to [require, exports, module] if no deps
            deps = !deps.length && callback.length ? ['require', 'exports', 'module'] : deps;
            for (i = 0; i < deps.length; i += 1) {
                map = makeMap(deps[i], relName);
                depName = map.f;

                //Fast path CommonJS standard dependencies.
                if (depName === "require") {
                    args[i] = handlers.require(name);
                } else if (depName === "exports") {
                    //CommonJS module spec 1.1
                    args[i] = handlers.exports(name);
                    usingExports = true;
                } else if (depName === "module") {
                    //CommonJS module spec 1.1
                    cjsModule = args[i] = handlers.module(name);
                } else if (hasProp(defined, depName) ||
                           hasProp(waiting, depName) ||
                           hasProp(defining, depName)) {
                    args[i] = callDep(depName);
                } else if (map.p) {
                    map.p.load(map.n, makeRequire(relName, true), makeLoad(depName), {});
                    args[i] = defined[depName];
                } else {
                    throw new Error(name + ' missing ' + depName);
                }
            }

            ret = callback ? callback.apply(defined[name], args) : undefined;

            if (name) {
                //If setting exports via "module" is in play,
                //favor that over return value and exports. After that,
                //favor a non-undefined return value over exports use.
                if (cjsModule && cjsModule.exports !== undef &&
                        cjsModule.exports !== defined[name]) {
                    defined[name] = cjsModule.exports;
                } else if (ret !== undef || !usingExports) {
                    //Use the return value from the function.
                    defined[name] = ret;
                }
            }
        } else if (name) {
            //May just be an object definition for the module. Only
            //worry about defining if have a module name.
            defined[name] = callback;
        }
    };

    requirejs = require = req = function (deps, callback, relName, forceSync, alt) {
        if (typeof deps === "string") {
            if (handlers[deps]) {
                //callback in this case is really relName
                return handlers[deps](callback);
            }
            //Just return the module wanted. In this scenario, the
            //deps arg is the module name, and second arg (if passed)
            //is just the relName.
            //Normalize module name, if it contains . or ..
            return callDep(makeMap(deps, callback).f);
        } else if (!deps.splice) {
            //deps is a config object, not an array.
            config = deps;
            if (config.deps) {
                req(config.deps, config.callback);
            }
            if (!callback) {
                return;
            }

            if (callback.splice) {
                //callback is an array, which means it is a dependency list.
                //Adjust args if there are dependencies
                deps = callback;
                callback = relName;
                relName = null;
            } else {
                deps = undef;
            }
        }

        //Support require(['a'])
        callback = callback || function () {};

        //If relName is a function, it is an errback handler,
        //so remove it.
        if (typeof relName === 'function') {
            relName = forceSync;
            forceSync = alt;
        }

        //Simulate async callback;
        if (forceSync) {
            main(undef, deps, callback, relName);
        } else {
            //Using a non-zero value because of concern for what old browsers
            //do, and latest browsers "upgrade" to 4 if lower value is used:
            //http://www.whatwg.org/specs/web-apps/current-work/multipage/timers.html#dom-windowtimers-settimeout:
            //If want a value immediately, use require('id') instead -- something
            //that works in almond on the global level, but not guaranteed and
            //unlikely to work in other AMD implementations.
            setTimeout(function () {
                main(undef, deps, callback, relName);
            }, 4);
        }

        return req;
    };

    /**
     * Just drops the config on the floor, but returns req in case
     * the config return value is used.
     */
    req.config = function (cfg) {
        return req(cfg);
    };

    /**
     * Expose module registry for debugging and tooling
     */
    requirejs._defined = defined;

    define = function (name, deps, callback) {

        //This module may not have dependencies
        if (!deps.splice) {
            //deps is not an array, so probably means
            //an object literal or factory function for
            //the value. Adjust args.
            callback = deps;
            deps = [];
        }

        if (!hasProp(defined, name) && !hasProp(waiting, name)) {
            waiting[name] = [name, deps, callback];
        }
    };

    define.amd = {
        jQuery: true
    };
}());

define("../bower_components/almond/almond", function(){});

define('mediator',[], function () {
  

  var publish;
  var subscribe;
  var mediator;
  var log;

  mediator = {};
  mediator.channels = {};

  log = function (type, channel, args) {
    /*eslint-disable no-console*/
    console.log(Date.now() + ': ' + type + ' ' + channel, args);
    /*eslint-enable no-console*/
  };

  publish = function (channel) {
    var args;
    var i;
    var subscription;

    if (!mediator.channels[channel]) {
      return false;
    }
    args = Array.prototype.slice.call(arguments, 1);
    for (i = 0; i < mediator.channels[channel].length; i++) {
      subscription = mediator.channels[channel][i];
      subscription.callback.apply(subscription.context, args);
    }

    if (BMP.Debug) {
      log('Publish', channel, args);
    }

    return this;
  };

  subscribe = function (channel, fn) {
    if (!mediator.channels[channel]) {
      mediator.channels[channel] = [];
    }
    mediator.channels[channel].push({ context: this, callback: fn });

    if (BMP.Debug) {
      log('Subscribe', channel);
    }

    return this;
  };

  return {
    publish: publish,
    subscribe: subscribe
  };
});

define('facade',['mediator'], function (mediator) {
  

  var publish;
  var subscribe;

  publish = function () {
    mediator.publish.apply(this, arguments);
  };

  subscribe = function (subscriber, channel, callback) {
    // subscriber is here to allow future permission checking
    mediator.subscribe(channel, callback);
  };

  return {
    publish: publish,
    subscribe: subscribe
  };
});

define('implementations',[],function () {
  
  return {
    'data': [
      {
        isAvailable: function () {
          try {
            return Modernizr.indexeddb && window.indexedDB.open('idbTest', 1).onupgradeneeded === null && navigator.userAgent.indexOf('iPhone') === -1 && navigator.userAgent.indexOf('iPad') === -1 || window.BMP.BIC.isBlinkGap && Modernizr.websqldatabase;
          } catch (ignore) {}
          return false;
        },

        implementation: 'data-pouch'
      },

      {
        isAvailable: function () {
          return true;
        },

        implementation: 'data-inMemory'
      }
    ],
    'api': [
      {
        isAvailable: function () {
          return window.cordova && window.cordova.offline;
        },
        implementation: 'api-native'
      },
      {
        isAvailable: function () {
          return true;
        },
        implementation: 'api-web'
      }
    ]
  };
});

/**
 * AMD-Feature - A loader plugin for AMD loaders.
 * 
 * https://github.com/jensarps/AMD-feature
 *
 * @author Jens Arps - http://jensarps.de/
 * @license MIT or BSD - https://github.com/jensarps/AMD-feature/blob/master/LICENSE
 * @version 1.1.0
 */
define('feature',['implementations'], function (implementations) {

  return {

    load: function (name, req, load, config) {

      var i, m, toLoad,
          featureInfo = implementations[name],
          hasMultipleImpls = Object.prototype.toString.call(featureInfo) == '[object Array]';

      if (config.isBuild && hasMultipleImpls) {
        // In build context, we want all possible
        // implementations included.
        for (i = 0, m = featureInfo.length; i < m; i++) {
          if (featureInfo[i].implementation) {
            req([featureInfo[i].implementation], load);
          }
        }

        // We're done here now.
        return;
      }

      if (hasMultipleImpls) {
        // We have different implementations available,
        // test for the one to use.
        for (i = 0, m = featureInfo.length; i < m; i++) {
          var current = featureInfo[i];
          if (current.isAvailable()) {
            if (typeof current.module != 'undefined') {
              load(current.module());
              return;
            }
            toLoad = current.implementation;
            break;
          }
        }
      } else {
        if (typeof featureInfo.module != 'undefined') {
          load(featureInfo.module());
          return;
        }
        toLoad = featureInfo;
      }

      req([toLoad], load);
    }
  };
});

//     uuid.js
//
//     Copyright (c) 2010-2012 Robert Kieffer
//     MIT License - http://opensource.org/licenses/mit-license.php

(function() {
  var _global = this;

  // Unique ID creation requires a high quality random # generator.  We feature
  // detect to determine the best RNG source, normalizing to a function that
  // returns 128-bits of randomness, since that's what's usually required
  var _rng;

  // Node.js crypto-based RNG - http://nodejs.org/docs/v0.6.2/api/crypto.html
  //
  // Moderately fast, high quality
  if (typeof(require) == 'function') {
    try {
      var _rb = require('crypto').randomBytes;
      _rng = _rb && function() {return _rb(16);};
    } catch(e) {}
  }

  if (!_rng && _global.crypto && crypto.getRandomValues) {
    // WHATWG crypto-based RNG - http://wiki.whatwg.org/wiki/Crypto
    //
    // Moderately fast, high quality
    var _rnds8 = new Uint8Array(16);
    _rng = function whatwgRNG() {
      crypto.getRandomValues(_rnds8);
      return _rnds8;
    };
  }

  if (!_rng) {
    // Math.random()-based (RNG)
    //
    // If all else fails, use Math.random().  It's fast, but is of unspecified
    // quality.
    var  _rnds = new Array(16);
    _rng = function() {
      for (var i = 0, r; i < 16; i++) {
        if ((i & 0x03) === 0) r = Math.random() * 0x100000000;
        _rnds[i] = r >>> ((i & 0x03) << 3) & 0xff;
      }

      return _rnds;
    };
  }

  // Buffer class to use
  var BufferClass = typeof(Buffer) == 'function' ? Buffer : Array;

  // Maps for number <-> hex string conversion
  var _byteToHex = [];
  var _hexToByte = {};
  for (var i = 0; i < 256; i++) {
    _byteToHex[i] = (i + 0x100).toString(16).substr(1);
    _hexToByte[_byteToHex[i]] = i;
  }

  // **`parse()` - Parse a UUID into it's component bytes**
  function parse(s, buf, offset) {
    var i = (buf && offset) || 0, ii = 0;

    buf = buf || [];
    s.toLowerCase().replace(/[0-9a-f]{2}/g, function(oct) {
      if (ii < 16) { // Don't overflow!
        buf[i + ii++] = _hexToByte[oct];
      }
    });

    // Zero out remaining bytes if string was short
    while (ii < 16) {
      buf[i + ii++] = 0;
    }

    return buf;
  }

  // **`unparse()` - Convert UUID byte array (ala parse()) into a string**
  function unparse(buf, offset) {
    var i = offset || 0, bth = _byteToHex;
    return  bth[buf[i++]] + bth[buf[i++]] +
            bth[buf[i++]] + bth[buf[i++]] + '-' +
            bth[buf[i++]] + bth[buf[i++]] + '-' +
            bth[buf[i++]] + bth[buf[i++]] + '-' +
            bth[buf[i++]] + bth[buf[i++]] + '-' +
            bth[buf[i++]] + bth[buf[i++]] +
            bth[buf[i++]] + bth[buf[i++]] +
            bth[buf[i++]] + bth[buf[i++]];
  }

  // **`v1()` - Generate time-based UUID**
  //
  // Inspired by https://github.com/LiosK/UUID.js
  // and http://docs.python.org/library/uuid.html

  // random #'s we need to init node and clockseq
  var _seedBytes = _rng();

  // Per 4.5, create and 48-bit node id, (47 random bits + multicast bit = 1)
  var _nodeId = [
    _seedBytes[0] | 0x01,
    _seedBytes[1], _seedBytes[2], _seedBytes[3], _seedBytes[4], _seedBytes[5]
  ];

  // Per 4.2.2, randomize (14 bit) clockseq
  var _clockseq = (_seedBytes[6] << 8 | _seedBytes[7]) & 0x3fff;

  // Previous uuid creation time
  var _lastMSecs = 0, _lastNSecs = 0;

  // See https://github.com/broofa/node-uuid for API details
  function v1(options, buf, offset) {
    var i = buf && offset || 0;
    var b = buf || [];

    options = options || {};

    var clockseq = options.clockseq != null ? options.clockseq : _clockseq;

    // UUID timestamps are 100 nano-second units since the Gregorian epoch,
    // (1582-10-15 00:00).  JSNumbers aren't precise enough for this, so
    // time is handled internally as 'msecs' (integer milliseconds) and 'nsecs'
    // (100-nanoseconds offset from msecs) since unix epoch, 1970-01-01 00:00.
    var msecs = options.msecs != null ? options.msecs : new Date().getTime();

    // Per 4.2.1.2, use count of uuid's generated during the current clock
    // cycle to simulate higher resolution clock
    var nsecs = options.nsecs != null ? options.nsecs : _lastNSecs + 1;

    // Time since last uuid creation (in msecs)
    var dt = (msecs - _lastMSecs) + (nsecs - _lastNSecs)/10000;

    // Per 4.2.1.2, Bump clockseq on clock regression
    if (dt < 0 && options.clockseq == null) {
      clockseq = clockseq + 1 & 0x3fff;
    }

    // Reset nsecs if clock regresses (new clockseq) or we've moved onto a new
    // time interval
    if ((dt < 0 || msecs > _lastMSecs) && options.nsecs == null) {
      nsecs = 0;
    }

    // Per 4.2.1.2 Throw error if too many uuids are requested
    if (nsecs >= 10000) {
      throw new Error('uuid.v1(): Can\'t create more than 10M uuids/sec');
    }

    _lastMSecs = msecs;
    _lastNSecs = nsecs;
    _clockseq = clockseq;

    // Per 4.1.4 - Convert from unix epoch to Gregorian epoch
    msecs += 12219292800000;

    // `time_low`
    var tl = ((msecs & 0xfffffff) * 10000 + nsecs) % 0x100000000;
    b[i++] = tl >>> 24 & 0xff;
    b[i++] = tl >>> 16 & 0xff;
    b[i++] = tl >>> 8 & 0xff;
    b[i++] = tl & 0xff;

    // `time_mid`
    var tmh = (msecs / 0x100000000 * 10000) & 0xfffffff;
    b[i++] = tmh >>> 8 & 0xff;
    b[i++] = tmh & 0xff;

    // `time_high_and_version`
    b[i++] = tmh >>> 24 & 0xf | 0x10; // include version
    b[i++] = tmh >>> 16 & 0xff;

    // `clock_seq_hi_and_reserved` (Per 4.2.2 - include variant)
    b[i++] = clockseq >>> 8 | 0x80;

    // `clock_seq_low`
    b[i++] = clockseq & 0xff;

    // `node`
    var node = options.node || _nodeId;
    for (var n = 0; n < 6; n++) {
      b[i + n] = node[n];
    }

    return buf ? buf : unparse(b);
  }

  // **`v4()` - Generate random UUID**

  // See https://github.com/broofa/node-uuid for API details
  function v4(options, buf, offset) {
    // Deprecated - 'format' argument, as supported in v1.2
    var i = buf && offset || 0;

    if (typeof(options) == 'string') {
      buf = options == 'binary' ? new BufferClass(16) : null;
      options = null;
    }
    options = options || {};

    var rnds = options.random || (options.rng || _rng)();

    // Per 4.4, set bits for version and `clock_seq_hi_and_reserved`
    rnds[6] = (rnds[6] & 0x0f) | 0x40;
    rnds[8] = (rnds[8] & 0x3f) | 0x80;

    // Copy bytes to buffer, if provided
    if (buf) {
      for (var ii = 0; ii < 16; ii++) {
        buf[i + ii] = rnds[ii];
      }
    }

    return buf || unparse(rnds);
  }

  // Export public API
  var uuid = v4;
  uuid.v1 = v1;
  uuid.v4 = v4;
  uuid.parse = parse;
  uuid.unparse = unparse;
  uuid.BufferClass = BufferClass;

  if (typeof define === 'function' && define.amd) {
    // Publish as AMD module
    define('uuid',[],function() {return uuid;});
  } else if (typeof(module) != 'undefined' && module.exports) {
    // Publish as node.js module
    module.exports = uuid;
  } else {
    // Publish as global (in browsers)
    var _previousRoot = _global.uuid;

    // **`noConflict()` - (browser only) to reset global 'uuid' var**
    uuid.noConflict = function() {
      _global.uuid = _previousRoot;
      return uuid;
    };

    _global.uuid = uuid;
  }
}).call(this);

define(
  'api-native',['uuid'],
  function (uuid) {
    
    var API = {
      getAnswerSpaceMap: function (user) {
        return new Promise(function (resolve, reject) {
          var userString = '';
          if (user) {
            userString = '&_username=' + user;
          }
          cordova.offline.retrieveContent(
            function (data) {
              resolve(JSON.parse(data));
            },
            reject,
            {
              url: '/_R_/common/3/xhr/GetConfig.php?_asn=' + window.BMP.BIC.siteVars.answerSpace.toLowerCase() + userString
            }
          );
        });
      },

      getInteractionResult: function (iact, args, options) {
        var getargs = '';
        if (args && typeof args === 'object') {
          _.each(args, function (value, key) {
            if (value) {
              getargs += '&' + key + '=' + value;
            }
          });
        }
        return $.ajax('/_R_/common/3/xhr/GetAnswer.php?asn=' + window.BMP.BIC.siteVars.answerSpace.toLowerCase() + '&iact=' + iact + '&ajax=false' + getargs, options);
      },

      getForm: function () {
        return new Promise(function (resolve, reject) {
          cordova.offline.retrieveContent(
            function (data) {
              resolve(JSON.parse(data));
            },
            reject,
            {
              url: '/_R_/common/3/xhr/GetForm.php?_v=3&_aid=' + window.BMP.BIC.siteVars.answerSpaceId
            }
          );
        });
      },

      getDataSuitcase: function (suitcase, time) {
        return new Promise(function (resolve, reject) {
          cordova.offline.retrieveContent(
            resolve,
            reject,
            {
              url: '/_R_/common/3/xhr/GetMoJO.php?_id=' + window.BMP.BIC.siteVars.answerSpaceId + '&_m=' + suitcase + '&_lc=' + time
            }
          );
        });
      },

      setPendingItem: function (formname, formaction, formdata) {
        formdata._uuid = uuid.v4();
        formdata._submittedTime = $.now();
        formdata._submittedTimezoneOffset = (new Date()).getTimezoneOffset();
        formdata._submittedTimezoneOffset /= -60;
        return $.post('/_R_/common/3/xhr/SaveFormRecord.php?_asid=' + window.BMP.BIC.siteVars.answerSpaceId + '&_fn=' + formname + '&_action=' + formaction, formdata);
      },

      getLoginStatus: function () {
        return $.ajax('/_R_/common/3/xhr/GetLogin.php');
      },

      getFormList: function (formName) {
        return new Promise(function (resolve, reject) {
          cordova.offline.retrieveContent(
            function (data) {
              resolve($.parseXML(data));
            },
            reject,
            {
              url: '/_R_/common/3/xhr/GetFormList.php?_asid=' + window.BMP.BIC.siteVars.answerSpaceId + '&_fn=' + formName
            }
          );
        });
      },

      getFormRecord: function (formName, formAction, recordID) {
        return new Promise(function (resolve, reject) {
          cordova.offline.retrieveContent(
            function (data) {
              resolve($.parseXML(data));
            },
            reject,
            {
              url: '/_R_/common/3/xhr/GetFormRecord.php?_asid=' + window.BMP.BIC.siteVars.answerSpaceId + '&_fn=' + formName + '&_tid=' + recordID + '&action=' + formAction
            }
          );
        });
      }
    };

    return API;
  }
);


define(
  'api-web',['uuid'],
  function (uuid) {
    
    var API = {
      getAnswerSpaceMap: function (user) {
        var userString = '';
        if (user) {
          userString = '&_username=' + user;
        }
        return $.ajax('/_R_/common/3/xhr/GetConfig.php?_asn=' + window.BMP.BIC.siteVars.answerSpace.toLowerCase() + userString);
      },

      getInteractionResult: function (iact, args, options) {
        var getargs = '';
        if (args && typeof args === 'object') {
          _.each(args, function (value, key) {
            if (value) {
              getargs += '&' + key + '=' + value;
            }
          });
        }
        return $.ajax('/_R_/common/3/xhr/GetAnswer.php?asn=' + window.BMP.BIC.siteVars.answerSpace.toLowerCase() + '&iact=' + iact + '&ajax=false' + getargs, options);
      },

      getForm: function () {
        return $.ajax('/_R_/common/3/xhr/GetForm.php?_v=3&_aid=' + window.BMP.BIC.siteVars.answerSpaceId);
      },

      getDataSuitcase: function (suitcase, time) {
        return $.ajax('/_R_/common/3/xhr/GetMoJO.php?_id=' + window.BMP.BIC.siteVars.answerSpaceId + '&_m=' + suitcase + '&_lc=' + time, {dataType: 'text'});
      },

      setPendingItem: function (formname, formaction, formdata) {
        formdata._uuid = uuid.v4();
        formdata._submittedTime = $.now();
        formdata._submittedTimezoneOffset = (new Date()).getTimezoneOffset();
        formdata._submittedTimezoneOffset /= -60;
        return $.post('/_R_/common/3/xhr/SaveFormRecord.php?_asid=' + window.BMP.BIC.siteVars.answerSpaceId + '&_fn=' + formname + '&_action=' + formaction, formdata);
      },

      getLoginStatus: function () {
        return $.ajax('/_R_/common/3/xhr/GetLogin.php');
      },

      getFormList: function (formName) {
        return $.ajax('/_R_/common/3/xhr/GetFormList.php?_asid=' + window.BMP.BIC.siteVars.answerSpaceId + '&_fn=' + formName);
      },

      getFormRecord: function (formName, formAction, recordID) {
        return $.ajax('/_R_/common/3/xhr/GetFormRecord.php?_asid=' + window.BMP.BIC.siteVars.answerSpaceId + '&_fn=' + formName + '&_tid=' + recordID + '&action=' + formAction);
      }

    };

    return API;
  }
);

define(
  'model-interaction',['facade', 'feature!api'],
  function (facade, API) {
    
    var Interaction = Backbone.Model.extend({

      idAttribute: '_id',

      defaults: {
        header: null,
        content: null,
        contentTime: null,
        footer: null,
        name: null
      },

      inherit: function (config) {
        var app = require('model-application');
        var parent;

        if (this.has('parent')) {
          _.each(this.attributes, function (value, key) {
            if (!_.has(config, key) || !config[key]) {
              config[key] = value;
            }
          }, this);

          if (this.get('parent') !== 'app') {
            // Not the answerSpace config, so go deeper
            parent = app.interactions.get(this.get('parent'));
            parent.inherit(config);
          } else {
            _.each(app.attributes, function (value, key) {
              if (!_.has(config, key) || !config[key]) {
                config[key] = value;
              }
            }, app);
          }
        }
        return config;
      },

      prepareForView: function (data) {
        // Handle MADL updates here
        // Check for other updates needed here?
        var model = this;

        return new Promise(function (resolve, reject) {
          if (model.id === window.BMP.BIC.siteVars.answerSpace.toLowerCase()) {
            model.prepareAnswerSpace(resolve, reject, data);
          }

          if (model.get('type') === 'madl code') {
            model.prepareMADL(resolve, reject, data);
          }

          if (model.get('type') === 'xslt' && model.get('xml').indexOf('stars:') === 0) {
            model.set({
              mojoType: 'stars',
              xml: model.get('xml').replace(/^stars:/, '')
            });
          }

          if (model.get('type') === 'xslt' && model.get('mojoType') === 'stars') {
            model.prepareStars(resolve);
          }

          if (model.get('type') !== 'madl code' && model.id !== window.BMP.BIC.siteVars.answerSpace.toLowerCase()) {
            resolve(model);
          }

        });
      },

      prepareAnswerSpace: function (resolve, reject, data) {
        var model = this;
        require(['model-application'], function (app) {
          var homeInteraction;
          var loginInteraction;
          var path;

          if (app.has('homeScreen') && app.get('homeScreen') !== false && app.has('homeInteraction')) {
            homeInteraction = app.interactions.findWhere({dbid: 'i' + app.get('homeInteraction')});
            if (homeInteraction) {
              homeInteraction.set({parent: model.get('parent')});
              homeInteraction.prepareForView(data).then(function () {
                resolve(homeInteraction);
              });
            } else {
              reject();
            }
          } else {
            model.set({interactionList: _.map(_.filter(app.interactions.models, function (value) {
              return value.id !== window.BMP.BIC.siteVars.answerSpace.toLowerCase() && value.get('display') !== 'hide' && (!value.has('tags') || value.has('tags') && value.get('tags').length === 0 || _.filter(value.get('tags'), function (element) {
                return element === 'nav-' + window.BMP.BIC.siteVars.answerSpace.toLowerCase();
              }, this).length > 0);
            }, this), function (value) {
              return value.attributes;
            })});

            if (model.get('interactionList').length === 0 && app.has('loginAccess') && app.get('loginAccess') === true && app.has('loginPromptInteraction')) {
              loginInteraction = app.interactions.findWhere({dbid: 'i' + app.get('loginPromptInteraction')});

              path = $.mobile.path.parseLocation().pathname;
              if (path.slice(-1) === '/') {
                path = path.slice(0, path.length - 1);
              }

              resolve(model);
              $.mobile.changePage(path + '/' + loginInteraction.id);
            } else {
              resolve(model);
            }
          }
        });
      },

      prepareMADL: function (resolve, reject, data) {
        var model = this;
        require(['model-application'], function (app) {
          API.getInteractionResult(model.id, model.get('args'), data.options).then(
            // Online
            function (result) {
              model.save({
                content: result,
                contentTime: Date.now()
              }, {
                success: function () {
                  var credentials;
                  resolve(model);

                  if (app.get('loginAccess') && 'i' + app.get('loginPromptInteraction') === model.get('dbid')) {
                    app.checkLoginStatus().then(function () {
                      if (app.get('loginStatus') === 'LOGGED IN' && data.options.data) {
                        credentials = model.parseAuthString(data.options.data);
                        facade.publish('storeAuth', credentials);
                        model.save({
                          'content-principal': result
                        });
                      } else if (!model.get('args')['args[logout]']) {
                        // Logged Out
                        model.save({
                          'content-anonymous': result
                        });
                      }
                    });
                  }
                },
                error: function () {
                  resolve(model);
                }
              });
            },
            function (jqXHR, textStatus, errorThrown) {
              // Offline
              var credentials;

              if (app.get('loginAccess') && 'i' + app.get('loginPromptInteraction') === model.get('dbid')) {
                if (data.options.data) {
                  // Offline login attempt;
                  credentials = model.parseAuthString(data.options.data);
                  model.listenToOnce(app, 'loginProcessed', function () {
                    if (app.get('loginStatus') === 'LOGGED IN') {
                      model.set('content', model.get('content-principal'));
                    } else {
                      model.set('content', model.get('content-anonymous'));
                    }
                    resolve(model);
                  });
                  facade.publish('authenticateAuth', credentials);
                } else {
                  model.set('content', model.get('content-anonymous'));
                  resolve(model);
                }
              } else {
                reject(errorThrown);
              }
            }
          );
        });
      },

      prepareStars: function (resolve) {
        var model = this;
        require(['model-application'], function (app) {
          var xml;
          var attrs;

          _.each(app.stars.where({type: model.get('xml')}), function (value) {
            xml += '<' + value.get('type') + ' id=' + value.get('_id') + '>';

            attrs = _.clone(value.attributes);
            delete attrs._id;
            delete attrs._rev;
            delete attrs.type;
            delete attrs.state;

            _.each(attrs, function (innerValue, key) {
              xml += '<' + key + '>' + innerValue + '</' + key + '>';
            });

            xml += '</' + value.get('type') + '>';
          });
          xml = '<stars>' + xml + '</stars>';
          model.set({
            starXml: xml
          });
          resolve(model);
        });
      },

      parseAuthString: function (authString) {
        var credentials = {};
        var i;
        var split;
        authString = authString.split('&');

        for (i = 0; i < authString.length; i++) {
          split = authString[i].split('=');
          switch (split[0]) {
            case 'username':
              credentials.principal = split[1];
              break;
            case 'password':
              credentials.credential = split[1];
              break;
            case 'submit':
              break;
            default:
              credentials[split[0]] = split[1];
          }
          if (!credentials.expiry) {
            // 3 day default expiry
            credentials.expiry = 86400000 * 3;
          }
        }

        return credentials;
      },

      performXSLT: function () {
        var xsl,
          xmlString,
          xslString,
          html,
          xml,
          processor,
          args,
          placeholders,
          pLength,
          p,
          value,
          model,
          starType,
          condition,
          variable;

        if (this.has('args')) {
          args = this.get('args');
          xsl = this.get('xsl');
          placeholders = xsl.match(/\$args\[[\w\:][\w\:\-\.]*\]/g);
          pLength = placeholders ? placeholders.length : 0;
          for (p = 0; p < pLength; p = p + 1) {
            value = typeof args[placeholders[p].substring(1)] === 'string' ? args[placeholders[p].substring(1)] : '';
            value = value.replace('', '');
            value = value.replace('', '');
            value = decodeURIComponent(value);
            xsl = xsl.replace(placeholders[p], value);
          }
        } else {
          xsl = this.get('xsl');
        }

        starType = xsl.match(/blink-stars\(([@\w.]+),\W*(\w+)\W*\)/);
        if (starType) {
          require(['model-application'], function (app) {
            var constructCondition;

            constructCondition = function (innerStarType) {
              condition = '';
              variable = innerStarType[1];
              innerStarType = innerStarType[2];
              _.each(app.stars.where({type: innerStarType}), function (innerValue) {
                condition += ' or ' + variable + '=\'' + innerValue.get('_id') + '\'';
              });
              condition = condition.substr(4);
              return condition;
            };

            while (starType) {
              condition = constructCondition(starType);

              if (condition.length > 0) {
                xsl = xsl.replace(/\(?blink-stars\(([@\w.]+),\W*(\w+)\W*\)\)?/, '(' + condition + ')');
              } else {
                xsl = xsl.replace(/\(?blink-stars\(([@\w.]+),\W*(\w+)\W*\)\)?/, '(false())');
              }

              starType = xsl.match(/blink-stars\(([@\w.]+),\W*(\w+)\W*\)/);
            }
          });
        }

        model = this;
        require(['model-application'], function (app) {
          xmlString = model.get('starXml') || app.datasuitcases.get(model.get('xml')).get('data');
          xslString = xsl;
          if (typeof xmlString !== 'string' || typeof xslString !== 'string') {
            model.set('content', 'XSLT failed due to poorly formed XML or XSL.');
            return;
          }
          xml = $.parseXML(xmlString);
          xsl = $.parseXML(xslString);
          if (window.XSLTProcessor) {
            //console.log('XSLTProcessor (W3C)');
            processor = new window.XSLTProcessor();
            processor.importStylesheet(xsl);
            html = processor.transformToFragment(xml, document);
          } else if (xml.transformNode !== undefined) {
            //console.log('transformNode (IE)');
            html = xml.transformNode(xsl);
          } else if (window.xsltProcess) {
            //console.log('AJAXSLT');
            html = window.xsltProcess(xml, xsl);
          } else {
            //console.log('XSLT: Not supported');
            html = '<p>Your browser does not support Data Suitcase keywords.</p>';
          }
          if (html) {
            model.set('content', html);
          }
        });
      }
    });

    return Interaction;
  }
);

define(
  'data-pouch',[],
  function () {
    

    var Data = function (name) {//, apiTrigger, apiCall, apiParameters) {
      var db;
      if (this.dbAdapter && name) {
        this.name = name;
      } else {
        this.name = 'BlinkMobile';
      }
      this.getDB = function () {
        var me = this;
        if (db) {
          return Promise.resolve(db);
        }
        return new Promise(function (resolve, reject) {
          var pouch;
          Pouch.prefix = '';
          pouch = new Pouch({
            name: me.name,
            adapter: me.dbAdapter(),
            /*eslint-disable camelcase*/
            auto_compaction: true
            /*eslint-enable camelcase*/
          }, function (err) {
            if (err) {
              reject(err);
            } else {
              db = pouch;
              resolve(db);
            }
          });
        });
      };
    };

    _.extend(Data.prototype, {

      dbAdapter: function () {
        var type = false;
        if (window.BMP.BIC.isBlinkGap === true && Pouch.adapters.websql) {
          type = 'websql';
        } else if (Pouch.adapters.idb) {
          type = 'idb';
        }
        return type;
      },

      create: function (model) {
        var that = this;
        return new Promise(function (resolve, reject) {
          that.getDB().then(function (db) {
            db.post(model.toJSON(), function (err, response) {
              if (err) {
                reject(err);
              } else {
                that.read(response).then(function (doc) {
                  resolve(doc);
                });
              }
            });
          });
        });
      },

      update: function (model) {
        var that = this;
        return new Promise(function (resolve, reject) {
          that.getDB().then(function (db) {
            db.put(model.toJSON(), function (err) {
              if (err) {
                reject(err);
              } else {
                that.read(model).then(function (doc) {
                  resolve(doc);
                });
              }
            });
          });
        });
      },

      read: function (model) {
        var that = this;
        return new Promise(function (resolve, reject) {
          that.getDB().then(function (db) {
            db.get(model.id, function (err, doc) {
              if (err) {
                reject(err);
              } else {
                resolve(doc);
              }
            });
          });
        });
      },

      readAll: function () {
        var that = this;
        return new Promise(function (resolve, reject) {
          that.getDB().then(function (db) {
            /*eslint-disable camelcase*/
            db.allDocs({include_docs: true}, function (err, response) {
              /*eslint-enable camelcase*/
              if (err) {
                reject(err);
              } else {
                resolve(_.map(response.rows, function (value) {
                  return value.doc;
                }));
              }
            });
          });
        });
      },

      'delete': function (model) {
        var that = this;
        return new Promise(function (resolve, reject) {
          that.getDB().then(function (db) {
            db.get(model.id, function (err, doc) {
              if (err) {
                reject(err);
              } else {
                db.remove(doc, function (innerErr, innerDoc) {
                  if (innerErr) {
                    reject(innerErr);
                  } else {
                    resolve(innerDoc);
                  }
                });
              }
            });
          });
        });
      },

      deleteAll: function () {
        var that = this;

        return new Promise(function (resolve, reject) {
          that.getDB().then(function (db) {
            db.destroy(function (err) {
              if (err) {
                reject(err);
              } else {
                that.db = null;
                resolve();
              }
            });
          });
        });
      }
    });

    return Data;
  }
);


define(
  'data-inMemory',[],
  function () {
    

    var Data = function () {
      this.data = {};
    };

    _.extend(Data.prototype, {
      create: function () {
        return Promise.reject('Persistent storage not available');
      },

      update: function () {
        return Promise.reject('Persistent storage not available');
      },

      read: function () {
        return Promise.reject('Persistent storage not available');
      },

      readAll: function () {
        return Promise.reject('Persistent storage not available');
      },

      'delete': function () {
        return Promise.reject('Persistent storage not available');
      }
    });

    return Data;
  }
);

define(
  'collection-interactions',['model-interaction', 'feature!data'],
  function (Interaction, Data) {
    
    var InteractionCollection = Backbone.Collection.extend({

      model: Interaction,

      datastore: function () {
        this.data = new Data(window.BMP.BIC.siteVars.answerSpace.toLowerCase() + '-Interaction');
        return this;
      },

      load: function () {
        var collection = this;

        return new Promise(function (resolve, reject) {
          collection.fetch({
            success: resolve,
            error: reject
          });
        });
      },

      save: function () {
        return Promise.all(_.map(this.models, function (model) {
          return new Promise(function (resolve, reject) {
            model.save({}, {
              success: resolve,
              error: reject
            });
          });
        }));
      },

      comparator: 'order'

    });

    return InteractionCollection;
  }
);

define(
  'model-datasuitcase',['feature!api'],
  function (API) {
    
    var DataSuitcase = Backbone.Model.extend({
      idAttribute: '_id',

      populate: function () {
        var model = this,
          time = 0;

        if (this.has('contentTime')) {
          time = this.get('contentTime');
        }

        return new Promise(function (resolve, reject) {
          API.getDataSuitcase(model.id, time).then(
            function (data) {
              model.save({
                data: data,
                contentTime: Date.now()
              }, {
                success: resolve,
                error: reject
              });
            }
          );
        });
      }
    });
    return DataSuitcase;
  }
);

define(
  'collection-datasuitcases',['model-datasuitcase', 'feature!data'],
  function (DataSuitcase, Data) {
    
    var DataSuitcaseCollection = Backbone.Collection.extend({
      model: DataSuitcase,

      datastore: function () {
        this.data = new Data(window.BMP.BIC.siteVars.answerSpace.toLowerCase() + '-DataSuitcase');
        return this;
      },

      load: function () {
        var collection = this;

        return new Promise(function (resolve, reject) {
          collection.fetch({
            success: resolve,
            error: resolve
          });
        });
      },

      save: function () {
        return Promise.all(_.map(this.models, function (model) {
          return new Promise(function (resolve, reject) {
            model.save({}, {
              success: resolve,
              error: reject
            });
          });
        }));
      }
    });
    return DataSuitcaseCollection;
  }
);

define(
  'model-form',['feature!api'],
  function (API) {
    
    var Form = Backbone.Model.extend({
      idAttribute: '_id',

      populate: function () {
        var model = this;
        API.getForm(this.id).then(
          function (data) {
            model.save({
              definition: data.definition,
              contentTime: Date.now()
            });
          }
        );
      }
    });

    return Form;
  }
);

define(
  'collection-forms',['model-form', 'feature!data', 'feature!api'],
  function (Form, Data, API) {
    
    var FormCollection = Backbone.Collection.extend({
      model: Form,

      initialize: function () {
        if (!BlinkForms) {
          window.BlinkForms = {};
        }
        BlinkForms.getDefinition = function (name, action) {
          return new Promise(function (resolve, reject) {
            require(['model-application'], function (app) {
              var def = app.forms.get(name);

              if (!def) {
                return reject(new Error('unable to locate "' + name + '" definition'));
              }

              try {
                resolve(BlinkForms.flattenDefinition(def.attributes, action));
              } catch (err) {
                reject(err);
              }
            });
          });
        };
      },

      datastore: function () {
        this.data = new Data(window.BMP.BIC.siteVars.answerSpace.toLowerCase() + '-Form');
        return this;
      },

      load: function () {
        var collection = this;

        return new Promise(function (resolve, reject) {
          collection.fetch({
            success: resolve,
            error: reject
          });
        });
      },

      download: function () {
        var collection = this;

        if (!(navigator.onLine || window.BMP.BIC.isBlinkGap)) {
          return Promise.resolve();
        }

        API.getForm().then(function (data) {
          _.each(data, function (recordData) {
            var record = JSON.parse(recordData),
              preExisting = collection.findWhere({_id: record.default.name});
            if (preExisting) {
              preExisting.set(record).save();
            } else {
              record._id = record.default.name;
              collection.create(record);
            }
          });
        });
      }

    });
    return FormCollection;
  }
);

define(
  'model-pending',[],
  function () {
    
    var PendingItem = Backbone.Model.extend({
      idAttribute: '_id'
    });

    return PendingItem;
  }
);

define(
  'collection-pending',['model-pending', 'feature!data', 'feature!api'],
  function (PendingItem, Data, API) {
    
    var PendingCollection = Backbone.Collection.extend({
      model: PendingItem,

      datastore: function () {
        this.data = new Data(window.BMP.BIC.siteVars.answerSpace.toLowerCase() + '-Pending');
        return this;
      },

      load: function () {
        var collection = this;

        return new Promise(function (resolve, reject) {
          collection.fetch({
            success: resolve,
            error: reject
          });
        });
      },

      processQueue: function () {
        var promises, callback;
        promises = [];
        callback = function (element, innerCallback) {
          return function (data, status, xhr) {
            var errors;

            if (data && xhr.status === 200) {
              element.save({
                status: 'Submitted',
                result: data
              });
            } else if (status === 'error' && data.responseText) {
              errors = JSON.parse(data.responseText);
              element.save({
                status: 'Failed Validation',
                errors: errors
              });
            }
            element.trigger('processed');
            innerCallback();
          };
        };

        _.each(this.where({status: 'Pending'}), function (element) {
          promises.push(new Promise(function (resolve, reject) {
            API.setPendingItem(element.get('name'), element.get('action'), element.get('data')).then(
              callback(element, resolve),
              callback(element, reject)
            );
          }));
        }, this);

        return Promise.all(promises);
      }
    });

    return PendingCollection;
  }
);

define(
  'model-star',[],
  function () {
    
    var Star = Backbone.Model.extend({
      idAttribute: '_id',

      initialize: function () {
        this.on('add', function () {
          this.save();
        }, this);
      },

      toggle: function () {
        var model = this;
        if (model.get('state')) {
          this.set('state', false);
        } else {
          this.set('state', true);
        }
        require(['model-application'], function (app) {
          if (model.get('state')) {
            app.stars.add(model);
          } else {
            model.destroy();
          }
        });
      }
    });

    return Star;
  }
);

define(
  'collection-stars',['model-star', 'feature!data'],
  function (Star, Data) {
    
    var FormCollection = Backbone.Collection.extend({
      model: Star,

      datastore: function () {
        this.data = new Data(window.BMP.BIC.siteVars.answerSpace.toLowerCase() + '-Star');
        return this;
      },

      load: function () {
        var collection = this;

        return new Promise(function (resolve, reject) {
          collection.fetch({
            success: resolve,
            error: reject
          });
        });
      },

      clear: function (type) {
        _.each(this.where({type: type}), function (model) {
          model.destroy();
        });
      }
    });
    return FormCollection;
  }
);

/**
 * @license RequireJS domReady 2.0.1 Copyright (c) 2010-2012, The Dojo Foundation All Rights Reserved.
 * Available via the MIT or new BSD license.
 * see: http://github.com/requirejs/domReady for details
 */
/*jslint */
/*global require: false, define: false, requirejs: false,
  window: false, clearInterval: false, document: false,
  self: false, setInterval: false */


define('domReady',[],function () {
    

    var isTop, testDiv, scrollIntervalId,
        isBrowser = typeof window !== "undefined" && window.document,
        isPageLoaded = !isBrowser,
        doc = isBrowser ? document : null,
        readyCalls = [];

    function runCallbacks(callbacks) {
        var i;
        for (i = 0; i < callbacks.length; i += 1) {
            callbacks[i](doc);
        }
    }

    function callReady() {
        var callbacks = readyCalls;

        if (isPageLoaded) {
            //Call the DOM ready callbacks
            if (callbacks.length) {
                readyCalls = [];
                runCallbacks(callbacks);
            }
        }
    }

    /**
     * Sets the page as loaded.
     */
    function pageLoaded() {
        if (!isPageLoaded) {
            isPageLoaded = true;
            if (scrollIntervalId) {
                clearInterval(scrollIntervalId);
            }

            callReady();
        }
    }

    if (isBrowser) {
        if (document.addEventListener) {
            //Standards. Hooray! Assumption here that if standards based,
            //it knows about DOMContentLoaded.
            document.addEventListener("DOMContentLoaded", pageLoaded, false);
            window.addEventListener("load", pageLoaded, false);
        } else if (window.attachEvent) {
            window.attachEvent("onload", pageLoaded);

            testDiv = document.createElement('div');
            try {
                isTop = window.frameElement === null;
            } catch (e) {}

            //DOMContentLoaded approximation that uses a doScroll, as found by
            //Diego Perini: http://javascript.nwbox.com/IEContentLoaded/,
            //but modified by other contributors, including jdalton
            if (testDiv.doScroll && isTop && window.external) {
                scrollIntervalId = setInterval(function () {
                    try {
                        testDiv.doScroll();
                        pageLoaded();
                    } catch (e) {}
                }, 30);
            }
        }

        //Check if document already complete, and if so, just trigger page load
        //listeners. Latest webkit browsers also use "interactive", and
        //will fire the onDOMContentLoaded before "interactive" but not after
        //entering "interactive" or "complete". More details:
        //http://dev.w3.org/html5/spec/the-end.html#the-end
        //http://stackoverflow.com/questions/3665561/document-readystate-of-interactive-vs-ondomcontentloaded
        //Hmm, this is more complicated on further use, see "firing too early"
        //bug: https://github.com/requirejs/domReady/issues/1
        //so removing the || document.readyState === "interactive" test.
        //There is still a window.onload binding that should get fired if
        //DOMContentLoaded is missed.
        if (document.readyState === "complete") {
            pageLoaded();
        }
    }

    /** START OF PUBLIC API **/

    /**
     * Registers a callback for DOM ready. If DOM is already ready, the
     * callback is called immediately.
     * @param {Function} callback
     */
    function domReady(callback) {
        if (isPageLoaded) {
            callback(doc);
        } else {
            readyCalls.push(callback);
        }
        return domReady;
    }

    domReady.version = '2.0.1';

    /**
     * Loader Plugin API method
     */
    domReady.load = function (name, req, onLoad, config) {
        if (config.isBuild) {
            onLoad(null);
        } else {
            domReady(onLoad);
        }
    };

    /** END OF PUBLIC API **/

    return domReady;
});

define(
  'model-form-record',['feature!api'],
  function (API) {
    
    var FormRecord = Backbone.Model.extend({
      idAttribute: '_id',

      populate: function (action, callback) {
        var model = this;
        API.getFormRecord(model.get('formName'), action, model.get('id')).then(
          function (data) {
            var nodes, node, record;

            record = {};
            nodes = data.evaluate('//' + model.get('formName'), data);
            node = nodes.iterateNext();

            _.each(node.children, function (key) {
              record[key.nodeName] = key.innerHTML;
            });

            model.set({
              record: record,
              contentTime: Date.now()
            });

            model.save({}, {
              success: callback,
              error: callback
            });
          }
        );
      }
    });

    return FormRecord;
  }
);

define(
  'collection-form-records',['model-form-record', 'feature!data', 'feature!api'],
  function (FormRecord, Data, API) {
    
    var FormRecordCollection = Backbone.Collection.extend({
      model: FormRecord,

      datastore: function () {
        this.data = new Data(window.BMP.BIC.siteVars.answerSpace.toLowerCase() + '-FormRecord');
        return this;
      },

      load: function () {
        var collection = this;

        return new Promise(function (resolve, reject) {
          collection.fetch({
            success: resolve,
            error: reject
          });
        });
      },

      pull: function (formName) {
        var collection = this;

        return new Promise(function (resolve, reject) {
          API.getFormList(formName).then(
            function (data) {
              var nodes, node, parsed, parseNodes;

              nodes = data.evaluate('//' + formName, data);
              node = nodes.iterateNext();

              parseNodes = function (key) {
                if (key.nodeName === 'id') {
                  parsed.id = key.innerHTML;
                } else {
                  parsed.list[key.nodeName] = key.innerHTML;
                }
              };

              while (node) {
                parsed = {};
                parsed.formName = formName;
                parsed.list = {};

                _.each(node.children, parseNodes);

                parsed._id = formName + '-' + parsed.id;

                collection.add(parsed, {merge: true});
                node = nodes.iterateNext();
              }

              resolve();
            },
            function () {
              reject();
            }
          );
        });
      }
    });
    return FormRecordCollection;
  }
);

define(
  'model-application',['facade', 'collection-interactions', 'collection-datasuitcases', 'collection-forms', 'collection-pending', 'feature!data', 'feature!api', 'collection-stars', 'domReady', 'collection-form-records'],
  function (facade, InteractionCollection, DataSuitcaseCollection, FormCollection, PendingCollection, Data, API, StarsCollection, domReady, FormRecordsCollection) {
    
    var Application = Backbone.Model.extend({

      idAttribute: '_id',

      defaults: {
        _id: window.BMP.BIC.siteVars.answerSpace.toLowerCase(),
        loginStatus: false
      },

      datastore: function () {
        this.data = new Data(window.BMP.BIC.siteVars.answerSpace.toLowerCase() + '-AnswerSpace');
        return this;
      },

      collections: function () {
        var app = this;

        if (this.collections._promise) {
          // return a cached promise when possible
          return this.collections._promise;
        }

        this.collections._promise = new Promise(function (resolve, reject) {
          pollUntil(function () {
            // need to wait for the data layer to be configured RE: cordova
            return !!app.data;
          }, null, function () {
            // now data is safe to use, so we can get started

            if (BMP.Authentication) {
              app.meta = new Data(window.BMP.BIC.siteVars.answerSpace.toLowerCase() + '-Meta');
              BMP.Authentication.getRecord = function (callback) {
                app.meta.read({
                  id: 'offlineLogin'
                }).then(
                  function (data) {
                    callback(null, data.attributes);
                  },
                  function (err) {
                    callback(err);
                  }
                );
              };
              BMP.Authentication.setRecord = function (data, callback) {
                var model = {};
                model.id = 'offlineLogin';
                model.toJSON = function () {
                  return model.attributes;
                };
                model.attributes = data;
                model.attributes._id = model.id;

                app.meta.read({
                  id: model.id
                }).then(
                  function () {
                    app.meta.delete({
                      id: model.id
                    }).then(
                      function () {
                        app.meta.create(model).then(
                          function (document) {
                            callback(null, document);
                          },
                          function (err) {
                            callback(err);
                          }
                        );
                      },
                      function (err) {
                        callback(err);
                      }
                    );
                  },
                  function () {
                    app.meta.create(model).then(
                      function (document) {
                        callback(null, document);
                      },
                      function (err) {
                        callback(err);
                      }
                    );
                  }
                );
              };
            }

            app.interactions = app.interactions || new InteractionCollection();
            app.datasuitcases = app.datasuitcases || new DataSuitcaseCollection();
            app.forms = app.forms || new FormCollection();
            app.pending = app.pending || new PendingCollection();
            app.stars = app.stars || new StarsCollection();
            app.formRecords = app.formRecords || new FormRecordsCollection();

            Promise.all([
              app.interactions.datastore().load(),
              app.datasuitcases.datastore().load(),
              app.forms.datastore().load(),
              app.pending.datastore().load(),
              app.stars.datastore().load(),
              app.formRecords.datastore().load()
            ]).then(resolve, reject);
          });
        });

        return this.collections._promise;
      },

      setup: function () {
        var app = this;

        facade.subscribe('applicationModel', 'loggedIn', function () {
          app.set('loginStatus', 'LOGGED IN');
          app.trigger('loginProcessed');
        });

        facade.subscribe('applicationModel', 'loggedOut', function () {
          app.set('loginStatus', 'LOGGED OUT');
          app.trigger('loginProcessed');
        });

        return new Promise(function (resolve, reject) {
          app.fetch({
            success: resolve,
            error: reject
          });
        });
      },

      populate: function () {
        var app = this;

        if (!(navigator.onLine || BMP.BlinkGap.isHere())) {
          return Promise.resolve();
        }

        return app.collections()
          .then(null, function () {
            return null;
          })
          .then(function () {
            return Promise.resolve(API.getAnswerSpaceMap());
          })
          .then(
            function (data) {
              return Promise.all(_.compact(_.map(data, function (value, key) {
                var model;
                if (key.substr(0, 1) === 'c' || key.substr(0, 1) === 'i') {
                  model = value.pertinent;
                  model._id = model.name.toLowerCase();
                  model.dbid = key;
                  app.interactions.add(model, {merge: true});
                  return model._id;
                }
                if (key.substr(0, 1) === 'a') {
                  return new Promise(function (resolve, reject) {
                    model = {
                      _id: window.BMP.BIC.siteVars.answerSpace.toLowerCase(),
                      dbid: key
                    };
                    app.interactions.add(model, {merge: true});
                    app.save(value.pertinent, {
                      success: function () {
                        resolve(window.BMP.BIC.siteVars.answerSpace.toLowerCase());
                      },
                      error: reject
                    });
                  });
                }
              })));
            }
          )
          .then(
            function (interactions) {
              return Promise.all(_.map(
                _.reject(app.interactions.models, function (model) {
                  return _.contains(interactions, model.id);
                }),
                function (model) {
                  return new Promise(function (resolve, reject) {
                    model.destroy({
                      success: resolve,
                      error: reject
                    });
                  });
                }
              ));
            }
          )
          .then(
            function () {
              return Promise.all(_.map(_.compact(_.uniq(app.interactions.pluck('xml'))), function (element) {
                return new Promise(function (resolve) { // args.[1] 'reject'
                  if (!app.datasuitcases.get(element)) {
                    app.datasuitcases.add({_id: element});
                    app.datasuitcases.get(element).populate().then(resolve, resolve);
                  } else {
                    app.datasuitcases.get(element).populate().then(resolve, resolve);
                  }
                });
              }));
            }
          )
          .then(
            function () {
              return app.datasuitcases.save();
            }
          )
          .then(
            function () {
              return app.interactions.save();
            }
          );
      },

      whenPopulated: function () {
        var me = this;
        return new Promise(function (resolve, reject) {
          me.collections().then(function () {
            var timeout;
            if (me.interactions.length) {
              resolve();
            } else {
              me.interactions.once('add', function () {
                clearTimeout(timeout);
                resolve();
              });
              timeout = setTimeout(function () {
                reject(new Error('whenPopulated timed out after 20 seconds'));
              }, 20e3);
            }
          }, function () {
            reject(new Error('whenPopulated failed due to collections'));
          });
        });
      },

      checkLoginStatus: function () {
        //false
        var app = this;

        return new Promise(function (resolve) {
          API.getLoginStatus().then(function (data) {
            var status = data.status || data;
            if (app.get('loginStatus') !== status) {
              app.populate().then(function () {
                app.set({loginStatus: status});
                resolve();
              });
            } else {
              resolve();
            }
          });
        });
      },

      initialRender: function () {
        var app = this;
        $.mobile.defaultPageTransition = app.get('defaultTransition');
        domReady(function () {
          $.mobile.changePage($.mobile.path.parseLocation().href, {
            changeHash: false,
            reloadPage: true,
            transition: 'fade'
          });
          $(document).one('pageshow', function () {
            if (window.BootStatus && window.BootStatus.notifySuccess) {
              window.BootStatus.notifySuccess();
            }
            $('#temp').remove();
          });
        });
      }
    });

    window.BMP.BIC3 = new Application();

    window.BMP.BIC3.history = { length: 0 };

    window.onpopstate = function () {
      window.BMP.BIC3.history.length += 1;
    };

    window.BMP.BIC3.version = '3.1.22';

    // keep BMP.BIC and BMP.BIC3 the same
    $.extend(window.BMP.BIC3, window.BMP.BIC);
    window.BMP.BIC = window.BMP.BIC3;

    return window.BMP.BIC3;
  }
);

function q(a){throw a;}var s=void 0,u=!1;var sjcl={cipher:{},hash:{},keyexchange:{},mode:{},misc:{},codec:{},exception:{corrupt:function(a){this.toString=function(){return"CORRUPT: "+this.message};this.message=a},invalid:function(a){this.toString=function(){return"INVALID: "+this.message};this.message=a},bug:function(a){this.toString=function(){return"BUG: "+this.message};this.message=a},notReady:function(a){this.toString=function(){return"NOT READY: "+this.message};this.message=a}}};
"undefined"!==typeof module&&module.exports&&(module.exports=sjcl);"function"===typeof define&&define('sjcl',[],function(){return sjcl});
sjcl.cipher.aes=function(a){this.k[0][0][0]||this.D();var b,c,d,e,f=this.k[0][4],g=this.k[1];b=a.length;var h=1;4!==b&&(6!==b&&8!==b)&&q(new sjcl.exception.invalid("invalid aes key size"));this.b=[d=a.slice(0),e=[]];for(a=b;a<4*b+28;a++){c=d[a-1];if(0===a%b||8===b&&4===a%b)c=f[c>>>24]<<24^f[c>>16&255]<<16^f[c>>8&255]<<8^f[c&255],0===a%b&&(c=c<<8^c>>>24^h<<24,h=h<<1^283*(h>>7));d[a]=d[a-b]^c}for(b=0;a;b++,a--)c=d[b&3?a:a-4],e[b]=4>=a||4>b?c:g[0][f[c>>>24]]^g[1][f[c>>16&255]]^g[2][f[c>>8&255]]^g[3][f[c&
255]]};
sjcl.cipher.aes.prototype={encrypt:function(a){return w(this,a,0)},decrypt:function(a){return w(this,a,1)},k:[[[],[],[],[],[]],[[],[],[],[],[]]],D:function(){var a=this.k[0],b=this.k[1],c=a[4],d=b[4],e,f,g,h=[],l=[],k,n,m,p;for(e=0;0x100>e;e++)l[(h[e]=e<<1^283*(e>>7))^e]=e;for(f=g=0;!c[f];f^=k||1,g=l[g]||1){m=g^g<<1^g<<2^g<<3^g<<4;m=m>>8^m&255^99;c[f]=m;d[m]=f;n=h[e=h[k=h[f]]];p=0x1010101*n^0x10001*e^0x101*k^0x1010100*f;n=0x101*h[m]^0x1010100*m;for(e=0;4>e;e++)a[e][f]=n=n<<24^n>>>8,b[e][m]=p=p<<24^p>>>8}for(e=
0;5>e;e++)a[e]=a[e].slice(0),b[e]=b[e].slice(0)}};
function w(a,b,c){4!==b.length&&q(new sjcl.exception.invalid("invalid aes block size"));var d=a.b[c],e=b[0]^d[0],f=b[c?3:1]^d[1],g=b[2]^d[2];b=b[c?1:3]^d[3];var h,l,k,n=d.length/4-2,m,p=4,t=[0,0,0,0];h=a.k[c];a=h[0];var r=h[1],v=h[2],y=h[3],z=h[4];for(m=0;m<n;m++)h=a[e>>>24]^r[f>>16&255]^v[g>>8&255]^y[b&255]^d[p],l=a[f>>>24]^r[g>>16&255]^v[b>>8&255]^y[e&255]^d[p+1],k=a[g>>>24]^r[b>>16&255]^v[e>>8&255]^y[f&255]^d[p+2],b=a[b>>>24]^r[e>>16&255]^v[f>>8&255]^y[g&255]^d[p+3],p+=4,e=h,f=l,g=k;for(m=0;4>
m;m++)t[c?3&-m:m]=z[e>>>24]<<24^z[f>>16&255]<<16^z[g>>8&255]<<8^z[b&255]^d[p++],h=e,e=f,f=g,g=b,b=h;return t}
sjcl.bitArray={bitSlice:function(a,b,c){a=sjcl.bitArray.P(a.slice(b/32),32-(b&31)).slice(1);return c===s?a:sjcl.bitArray.clamp(a,c-b)},extract:function(a,b,c){var d=Math.floor(-b-c&31);return((b+c-1^b)&-32?a[b/32|0]<<32-d^a[b/32+1|0]>>>d:a[b/32|0]>>>d)&(1<<c)-1},concat:function(a,b){if(0===a.length||0===b.length)return a.concat(b);var c=a[a.length-1],d=sjcl.bitArray.getPartial(c);return 32===d?a.concat(b):sjcl.bitArray.P(b,d,c|0,a.slice(0,a.length-1))},bitLength:function(a){var b=a.length;return 0===
b?0:32*(b-1)+sjcl.bitArray.getPartial(a[b-1])},clamp:function(a,b){if(32*a.length<b)return a;a=a.slice(0,Math.ceil(b/32));var c=a.length;b&=31;0<c&&b&&(a[c-1]=sjcl.bitArray.partial(b,a[c-1]&2147483648>>b-1,1));return a},partial:function(a,b,c){return 32===a?b:(c?b|0:b<<32-a)+0x10000000000*a},getPartial:function(a){return Math.round(a/0x10000000000)||32},equal:function(a,b){if(sjcl.bitArray.bitLength(a)!==sjcl.bitArray.bitLength(b))return u;var c=0,d;for(d=0;d<a.length;d++)c|=a[d]^b[d];return 0===
c},P:function(a,b,c,d){var e;e=0;for(d===s&&(d=[]);32<=b;b-=32)d.push(c),c=0;if(0===b)return d.concat(a);for(e=0;e<a.length;e++)d.push(c|a[e]>>>b),c=a[e]<<32-b;e=a.length?a[a.length-1]:0;a=sjcl.bitArray.getPartial(e);d.push(sjcl.bitArray.partial(b+a&31,32<b+a?c:d.pop(),1));return d},l:function(a,b){return[a[0]^b[0],a[1]^b[1],a[2]^b[2],a[3]^b[3]]},byteswapM:function(a){var b,c;for(b=0;b<a.length;++b)c=a[b],a[b]=c>>>24|c>>>8&0xff00|(c&0xff00)<<8|c<<24;return a}};
sjcl.codec.utf8String={fromBits:function(a){var b="",c=sjcl.bitArray.bitLength(a),d,e;for(d=0;d<c/8;d++)0===(d&3)&&(e=a[d/4]),b+=String.fromCharCode(e>>>24),e<<=8;return decodeURIComponent(escape(b))},toBits:function(a){a=unescape(encodeURIComponent(a));var b=[],c,d=0;for(c=0;c<a.length;c++)d=d<<8|a.charCodeAt(c),3===(c&3)&&(b.push(d),d=0);c&3&&b.push(sjcl.bitArray.partial(8*(c&3),d));return b}};
sjcl.codec.hex={fromBits:function(a){var b="",c;for(c=0;c<a.length;c++)b+=((a[c]|0)+0xf00000000000).toString(16).substr(4);return b.substr(0,sjcl.bitArray.bitLength(a)/4)},toBits:function(a){var b,c=[],d;a=a.replace(/\s|0x/g,"");d=a.length;a+="00000000";for(b=0;b<a.length;b+=8)c.push(parseInt(a.substr(b,8),16)^0);return sjcl.bitArray.clamp(c,4*d)}};
sjcl.codec.base64={J:"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/",fromBits:function(a,b,c){var d="",e=0,f=sjcl.codec.base64.J,g=0,h=sjcl.bitArray.bitLength(a);c&&(f=f.substr(0,62)+"-_");for(c=0;6*d.length<h;)d+=f.charAt((g^a[c]>>>e)>>>26),6>e?(g=a[c]<<6-e,e+=26,c++):(g<<=6,e-=6);for(;d.length&3&&!b;)d+="=";return d},toBits:function(a,b){a=a.replace(/\s|=/g,"");var c=[],d,e=0,f=sjcl.codec.base64.J,g=0,h;b&&(f=f.substr(0,62)+"-_");for(d=0;d<a.length;d++)h=f.indexOf(a.charAt(d)),
0>h&&q(new sjcl.exception.invalid("this isn't base64!")),26<e?(e-=26,c.push(g^h>>>e),g=h<<32-e):(e+=6,g^=h<<32-e);e&56&&c.push(sjcl.bitArray.partial(e&56,g,1));return c}};sjcl.codec.base64url={fromBits:function(a){return sjcl.codec.base64.fromBits(a,1,1)},toBits:function(a){return sjcl.codec.base64.toBits(a,1)}};sjcl.hash.sha256=function(a){this.b[0]||this.D();a?(this.r=a.r.slice(0),this.o=a.o.slice(0),this.h=a.h):this.reset()};sjcl.hash.sha256.hash=function(a){return(new sjcl.hash.sha256).update(a).finalize()};
sjcl.hash.sha256.prototype={blockSize:512,reset:function(){this.r=this.N.slice(0);this.o=[];this.h=0;return this},update:function(a){"string"===typeof a&&(a=sjcl.codec.utf8String.toBits(a));var b,c=this.o=sjcl.bitArray.concat(this.o,a);b=this.h;a=this.h=b+sjcl.bitArray.bitLength(a);for(b=512+b&-512;b<=a;b+=512)x(this,c.splice(0,16));return this},finalize:function(){var a,b=this.o,c=this.r,b=sjcl.bitArray.concat(b,[sjcl.bitArray.partial(1,1)]);for(a=b.length+2;a&15;a++)b.push(0);b.push(Math.floor(this.h/
4294967296));for(b.push(this.h|0);b.length;)x(this,b.splice(0,16));this.reset();return c},N:[],b:[],D:function(){function a(a){return 0x100000000*(a-Math.floor(a))|0}var b=0,c=2,d;a:for(;64>b;c++){for(d=2;d*d<=c;d++)if(0===c%d)continue a;8>b&&(this.N[b]=a(Math.pow(c,0.5)));this.b[b]=a(Math.pow(c,1/3));b++}}};
function x(a,b){var c,d,e,f=b.slice(0),g=a.r,h=a.b,l=g[0],k=g[1],n=g[2],m=g[3],p=g[4],t=g[5],r=g[6],v=g[7];for(c=0;64>c;c++)16>c?d=f[c]:(d=f[c+1&15],e=f[c+14&15],d=f[c&15]=(d>>>7^d>>>18^d>>>3^d<<25^d<<14)+(e>>>17^e>>>19^e>>>10^e<<15^e<<13)+f[c&15]+f[c+9&15]|0),d=d+v+(p>>>6^p>>>11^p>>>25^p<<26^p<<21^p<<7)+(r^p&(t^r))+h[c],v=r,r=t,t=p,p=m+d|0,m=n,n=k,k=l,l=d+(k&n^m&(k^n))+(k>>>2^k>>>13^k>>>22^k<<30^k<<19^k<<10)|0;g[0]=g[0]+l|0;g[1]=g[1]+k|0;g[2]=g[2]+n|0;g[3]=g[3]+m|0;g[4]=g[4]+p|0;g[5]=g[5]+t|0;g[6]=
g[6]+r|0;g[7]=g[7]+v|0}
sjcl.mode.ccm={name:"ccm",encrypt:function(a,b,c,d,e){var f,g=b.slice(0),h=sjcl.bitArray,l=h.bitLength(c)/8,k=h.bitLength(g)/8;e=e||64;d=d||[];7>l&&q(new sjcl.exception.invalid("ccm: iv must be at least 7 bytes"));for(f=2;4>f&&k>>>8*f;f++);f<15-l&&(f=15-l);c=h.clamp(c,8*(15-f));b=sjcl.mode.ccm.L(a,b,c,d,e,f);g=sjcl.mode.ccm.p(a,g,c,b,e,f);return h.concat(g.data,g.tag)},decrypt:function(a,b,c,d,e){e=e||64;d=d||[];var f=sjcl.bitArray,g=f.bitLength(c)/8,h=f.bitLength(b),l=f.clamp(b,h-e),k=f.bitSlice(b,
h-e),h=(h-e)/8;7>g&&q(new sjcl.exception.invalid("ccm: iv must be at least 7 bytes"));for(b=2;4>b&&h>>>8*b;b++);b<15-g&&(b=15-g);c=f.clamp(c,8*(15-b));l=sjcl.mode.ccm.p(a,l,c,k,e,b);a=sjcl.mode.ccm.L(a,l.data,c,d,e,b);f.equal(l.tag,a)||q(new sjcl.exception.corrupt("ccm: tag doesn't match"));return l.data},L:function(a,b,c,d,e,f){var g=[],h=sjcl.bitArray,l=h.l;e/=8;(e%2||4>e||16<e)&&q(new sjcl.exception.invalid("ccm: invalid tag length"));(0xffffffff<d.length||0xffffffff<b.length)&&q(new sjcl.exception.bug("ccm: can't deal with 4GiB or more data"));
f=[h.partial(8,(d.length?64:0)|e-2<<2|f-1)];f=h.concat(f,c);f[3]|=h.bitLength(b)/8;f=a.encrypt(f);if(d.length){c=h.bitLength(d)/8;65279>=c?g=[h.partial(16,c)]:0xffffffff>=c&&(g=h.concat([h.partial(16,65534)],[c]));g=h.concat(g,d);for(d=0;d<g.length;d+=4)f=a.encrypt(l(f,g.slice(d,d+4).concat([0,0,0])))}for(d=0;d<b.length;d+=4)f=a.encrypt(l(f,b.slice(d,d+4).concat([0,0,0])));return h.clamp(f,8*e)},p:function(a,b,c,d,e,f){var g,h=sjcl.bitArray;g=h.l;var l=b.length,k=h.bitLength(b);c=h.concat([h.partial(8,
f-1)],c).concat([0,0,0]).slice(0,4);d=h.bitSlice(g(d,a.encrypt(c)),0,e);if(!l)return{tag:d,data:[]};for(g=0;g<l;g+=4)c[3]++,e=a.encrypt(c),b[g]^=e[0],b[g+1]^=e[1],b[g+2]^=e[2],b[g+3]^=e[3];return{tag:d,data:h.clamp(b,k)}}};
sjcl.mode.ocb2={name:"ocb2",encrypt:function(a,b,c,d,e,f){128!==sjcl.bitArray.bitLength(c)&&q(new sjcl.exception.invalid("ocb iv must be 128 bits"));var g,h=sjcl.mode.ocb2.H,l=sjcl.bitArray,k=l.l,n=[0,0,0,0];c=h(a.encrypt(c));var m,p=[];d=d||[];e=e||64;for(g=0;g+4<b.length;g+=4)m=b.slice(g,g+4),n=k(n,m),p=p.concat(k(c,a.encrypt(k(c,m)))),c=h(c);m=b.slice(g);b=l.bitLength(m);g=a.encrypt(k(c,[0,0,0,b]));m=l.clamp(k(m.concat([0,0,0]),g),b);n=k(n,k(m.concat([0,0,0]),g));n=a.encrypt(k(n,k(c,h(c))));d.length&&
(n=k(n,f?d:sjcl.mode.ocb2.pmac(a,d)));return p.concat(l.concat(m,l.clamp(n,e)))},decrypt:function(a,b,c,d,e,f){128!==sjcl.bitArray.bitLength(c)&&q(new sjcl.exception.invalid("ocb iv must be 128 bits"));e=e||64;var g=sjcl.mode.ocb2.H,h=sjcl.bitArray,l=h.l,k=[0,0,0,0],n=g(a.encrypt(c)),m,p,t=sjcl.bitArray.bitLength(b)-e,r=[];d=d||[];for(c=0;c+4<t/32;c+=4)m=l(n,a.decrypt(l(n,b.slice(c,c+4)))),k=l(k,m),r=r.concat(m),n=g(n);p=t-32*c;m=a.encrypt(l(n,[0,0,0,p]));m=l(m,h.clamp(b.slice(c),p).concat([0,0,0]));
k=l(k,m);k=a.encrypt(l(k,l(n,g(n))));d.length&&(k=l(k,f?d:sjcl.mode.ocb2.pmac(a,d)));h.equal(h.clamp(k,e),h.bitSlice(b,t))||q(new sjcl.exception.corrupt("ocb: tag doesn't match"));return r.concat(h.clamp(m,p))},pmac:function(a,b){var c,d=sjcl.mode.ocb2.H,e=sjcl.bitArray,f=e.l,g=[0,0,0,0],h=a.encrypt([0,0,0,0]),h=f(h,d(d(h)));for(c=0;c+4<b.length;c+=4)h=d(h),g=f(g,a.encrypt(f(h,b.slice(c,c+4))));c=b.slice(c);128>e.bitLength(c)&&(h=f(h,d(h)),c=e.concat(c,[-2147483648,0,0,0]));g=f(g,c);return a.encrypt(f(d(f(h,
d(h))),g))},H:function(a){return[a[0]<<1^a[1]>>>31,a[1]<<1^a[2]>>>31,a[2]<<1^a[3]>>>31,a[3]<<1^135*(a[0]>>>31)]}};
sjcl.mode.gcm={name:"gcm",encrypt:function(a,b,c,d,e){var f=b.slice(0);b=sjcl.bitArray;d=d||[];a=sjcl.mode.gcm.p(!0,a,f,d,c,e||128);return b.concat(a.data,a.tag)},decrypt:function(a,b,c,d,e){var f=b.slice(0),g=sjcl.bitArray,h=g.bitLength(f);e=e||128;d=d||[];e<=h?(b=g.bitSlice(f,h-e),f=g.bitSlice(f,0,h-e)):(b=f,f=[]);a=sjcl.mode.gcm.p(u,a,f,d,c,e);g.equal(a.tag,b)||q(new sjcl.exception.corrupt("gcm: tag doesn't match"));return a.data},Z:function(a,b){var c,d,e,f,g,h=sjcl.bitArray.l;e=[0,0,0,0];f=b.slice(0);
for(c=0;128>c;c++){(d=0!==(a[Math.floor(c/32)]&1<<31-c%32))&&(e=h(e,f));g=0!==(f[3]&1);for(d=3;0<d;d--)f[d]=f[d]>>>1|(f[d-1]&1)<<31;f[0]>>>=1;g&&(f[0]^=-0x1f000000)}return e},g:function(a,b,c){var d,e=c.length;b=b.slice(0);for(d=0;d<e;d+=4)b[0]^=0xffffffff&c[d],b[1]^=0xffffffff&c[d+1],b[2]^=0xffffffff&c[d+2],b[3]^=0xffffffff&c[d+3],b=sjcl.mode.gcm.Z(b,a);return b},p:function(a,b,c,d,e,f){var g,h,l,k,n,m,p,t,r=sjcl.bitArray;m=c.length;p=r.bitLength(c);t=r.bitLength(d);h=r.bitLength(e);g=b.encrypt([0,
0,0,0]);96===h?(e=e.slice(0),e=r.concat(e,[1])):(e=sjcl.mode.gcm.g(g,[0,0,0,0],e),e=sjcl.mode.gcm.g(g,e,[0,0,Math.floor(h/0x100000000),h&0xffffffff]));h=sjcl.mode.gcm.g(g,[0,0,0,0],d);n=e.slice(0);d=h.slice(0);a||(d=sjcl.mode.gcm.g(g,h,c));for(k=0;k<m;k+=4)n[3]++,l=b.encrypt(n),c[k]^=l[0],c[k+1]^=l[1],c[k+2]^=l[2],c[k+3]^=l[3];c=r.clamp(c,p);a&&(d=sjcl.mode.gcm.g(g,h,c));a=[Math.floor(t/0x100000000),t&0xffffffff,Math.floor(p/0x100000000),p&0xffffffff];d=sjcl.mode.gcm.g(g,d,a);l=b.encrypt(e);d[0]^=l[0];
d[1]^=l[1];d[2]^=l[2];d[3]^=l[3];return{tag:r.bitSlice(d,0,f),data:c}}};sjcl.misc.hmac=function(a,b){this.M=b=b||sjcl.hash.sha256;var c=[[],[]],d,e=b.prototype.blockSize/32;this.n=[new b,new b];a.length>e&&(a=b.hash(a));for(d=0;d<e;d++)c[0][d]=a[d]^909522486,c[1][d]=a[d]^1549556828;this.n[0].update(c[0]);this.n[1].update(c[1]);this.G=new b(this.n[0])};
sjcl.misc.hmac.prototype.encrypt=sjcl.misc.hmac.prototype.mac=function(a){this.Q&&q(new sjcl.exception.invalid("encrypt on already updated hmac called!"));this.update(a);return this.digest(a)};sjcl.misc.hmac.prototype.reset=function(){this.G=new this.M(this.n[0]);this.Q=u};sjcl.misc.hmac.prototype.update=function(a){this.Q=!0;this.G.update(a)};sjcl.misc.hmac.prototype.digest=function(){var a=this.G.finalize(),a=(new this.M(this.n[1])).update(a).finalize();this.reset();return a};
sjcl.misc.pbkdf2=function(a,b,c,d,e){c=c||1E3;(0>d||0>c)&&q(sjcl.exception.invalid("invalid params to pbkdf2"));"string"===typeof a&&(a=sjcl.codec.utf8String.toBits(a));"string"===typeof b&&(b=sjcl.codec.utf8String.toBits(b));e=e||sjcl.misc.hmac;a=new e(a);var f,g,h,l,k=[],n=sjcl.bitArray;for(l=1;32*k.length<(d||1);l++){e=f=a.encrypt(n.concat(b,[l]));for(g=1;g<c;g++){f=a.encrypt(f);for(h=0;h<f.length;h++)e[h]^=f[h]}k=k.concat(e)}d&&(k=n.clamp(k,d));return k};
sjcl.prng=function(a){this.c=[new sjcl.hash.sha256];this.i=[0];this.F=0;this.s={};this.C=0;this.K={};this.O=this.d=this.j=this.W=0;this.b=[0,0,0,0,0,0,0,0];this.f=[0,0,0,0];this.A=s;this.B=a;this.q=u;this.w={progress:{},seeded:{}};this.m=this.V=0;this.t=1;this.u=2;this.S=0x10000;this.I=[0,48,64,96,128,192,0x100,384,512,768,1024];this.T=3E4;this.R=80};
sjcl.prng.prototype={randomWords:function(a,b){var c=[],d;d=this.isReady(b);var e;d===this.m&&q(new sjcl.exception.notReady("generator isn't seeded"));if(d&this.u){d=!(d&this.t);e=[];var f=0,g;this.O=e[0]=(new Date).valueOf()+this.T;for(g=0;16>g;g++)e.push(0x100000000*Math.random()|0);for(g=0;g<this.c.length&&!(e=e.concat(this.c[g].finalize()),f+=this.i[g],this.i[g]=0,!d&&this.F&1<<g);g++);this.F>=1<<this.c.length&&(this.c.push(new sjcl.hash.sha256),this.i.push(0));this.d-=f;f>this.j&&(this.j=f);this.F++;
this.b=sjcl.hash.sha256.hash(this.b.concat(e));this.A=new sjcl.cipher.aes(this.b);for(d=0;4>d&&!(this.f[d]=this.f[d]+1|0,this.f[d]);d++);}for(d=0;d<a;d+=4)0===(d+1)%this.S&&A(this),e=B(this),c.push(e[0],e[1],e[2],e[3]);A(this);return c.slice(0,a)},setDefaultParanoia:function(a,b){0===a&&"Setting paranoia=0 will ruin your security; use it only for testing"!==b&&q("Setting paranoia=0 will ruin your security; use it only for testing");this.B=a},addEntropy:function(a,b,c){c=c||"user";var d,e,f=(new Date).valueOf(),
g=this.s[c],h=this.isReady(),l=0;d=this.K[c];d===s&&(d=this.K[c]=this.W++);g===s&&(g=this.s[c]=0);this.s[c]=(this.s[c]+1)%this.c.length;switch(typeof a){case "number":b===s&&(b=1);this.c[g].update([d,this.C++,1,b,f,1,a|0]);break;case "object":c=Object.prototype.toString.call(a);if("[object Uint32Array]"===c){e=[];for(c=0;c<a.length;c++)e.push(a[c]);a=e}else{"[object Array]"!==c&&(l=1);for(c=0;c<a.length&&!l;c++)"number"!==typeof a[c]&&(l=1)}if(!l){if(b===s)for(c=b=0;c<a.length;c++)for(e=a[c];0<e;)b++,
e>>>=1;this.c[g].update([d,this.C++,2,b,f,a.length].concat(a))}break;case "string":b===s&&(b=a.length);this.c[g].update([d,this.C++,3,b,f,a.length]);this.c[g].update(a);break;default:l=1}l&&q(new sjcl.exception.bug("random: addEntropy only supports number, array of numbers or string"));this.i[g]+=b;this.d+=b;h===this.m&&(this.isReady()!==this.m&&C("seeded",Math.max(this.j,this.d)),C("progress",this.getProgress()))},isReady:function(a){a=this.I[a!==s?a:this.B];return this.j&&this.j>=a?this.i[0]>this.R&&
(new Date).valueOf()>this.O?this.u|this.t:this.t:this.d>=a?this.u|this.m:this.m},getProgress:function(a){a=this.I[a?a:this.B];return this.j>=a?1:this.d>a?1:this.d/a},startCollectors:function(){this.q||(this.a={loadTimeCollector:D(this,this.aa),mouseCollector:D(this,this.ba),keyboardCollector:D(this,this.$),accelerometerCollector:D(this,this.U),touchCollector:D(this,this.da)},window.addEventListener?(window.addEventListener("load",this.a.loadTimeCollector,u),window.addEventListener("mousemove",this.a.mouseCollector,
u),window.addEventListener("keypress",this.a.keyboardCollector,u),window.addEventListener("devicemotion",this.a.accelerometerCollector,u),window.addEventListener("touchmove",this.a.touchCollector,u)):document.attachEvent?(document.attachEvent("onload",this.a.loadTimeCollector),document.attachEvent("onmousemove",this.a.mouseCollector),document.attachEvent("keypress",this.a.keyboardCollector)):q(new sjcl.exception.bug("can't attach event")),this.q=!0)},stopCollectors:function(){this.q&&(window.removeEventListener?
(window.removeEventListener("load",this.a.loadTimeCollector,u),window.removeEventListener("mousemove",this.a.mouseCollector,u),window.removeEventListener("keypress",this.a.keyboardCollector,u),window.removeEventListener("devicemotion",this.a.accelerometerCollector,u),window.removeEventListener("touchmove",this.a.touchCollector,u)):document.detachEvent&&(document.detachEvent("onload",this.a.loadTimeCollector),document.detachEvent("onmousemove",this.a.mouseCollector),document.detachEvent("keypress",
this.a.keyboardCollector)),this.q=u)},addEventListener:function(a,b){this.w[a][this.V++]=b},removeEventListener:function(a,b){var c,d,e=this.w[a],f=[];for(d in e)e.hasOwnProperty(d)&&e[d]===b&&f.push(d);for(c=0;c<f.length;c++)d=f[c],delete e[d]},$:function(){E(1)},ba:function(a){var b,c;try{b=a.x||a.clientX||a.offsetX||0,c=a.y||a.clientY||a.offsetY||0}catch(d){c=b=0}0!=b&&0!=c&&sjcl.random.addEntropy([b,c],2,"mouse");E(0)},da:function(a){a=a.touches[0]||a.changedTouches[0];sjcl.random.addEntropy([a.pageX||
a.clientX,a.pageY||a.clientY],1,"touch");E(0)},aa:function(){E(2)},U:function(a){a=a.accelerationIncludingGravity.x||a.accelerationIncludingGravity.y||a.accelerationIncludingGravity.z;if(window.orientation){var b=window.orientation;"number"===typeof b&&sjcl.random.addEntropy(b,1,"accelerometer")}a&&sjcl.random.addEntropy(a,2,"accelerometer");E(0)}};function C(a,b){var c,d=sjcl.random.w[a],e=[];for(c in d)d.hasOwnProperty(c)&&e.push(d[c]);for(c=0;c<e.length;c++)e[c](b)}
function E(a){"undefined"!==typeof window&&window.performance&&"function"===typeof window.performance.now?sjcl.random.addEntropy(window.performance.now(),a,"loadtime"):sjcl.random.addEntropy((new Date).valueOf(),a,"loadtime")}function A(a){a.b=B(a).concat(B(a));a.A=new sjcl.cipher.aes(a.b)}function B(a){for(var b=0;4>b&&!(a.f[b]=a.f[b]+1|0,a.f[b]);b++);return a.A.encrypt(a.f)}function D(a,b){return function(){b.apply(a,arguments)}}sjcl.random=new sjcl.prng(6);
a:try{var F,G,H,I;if(I="undefined"!==typeof module){var J;if(J=module.exports){var K;try{K=require("crypto")}catch(L){K=null}J=(G=K)&&G.randomBytes}I=J}if(I)F=G.randomBytes(128),F=new Uint32Array((new Uint8Array(F)).buffer),sjcl.random.addEntropy(F,1024,"crypto['randomBytes']");else if("undefined"!==typeof window&&"undefined"!==typeof Uint32Array){H=new Uint32Array(32);if(window.crypto&&window.crypto.getRandomValues)window.crypto.getRandomValues(H);else if(window.msCrypto&&window.msCrypto.getRandomValues)window.msCrypto.getRandomValues(H);
else break a;sjcl.random.addEntropy(H,1024,"crypto['getRandomValues']")}}catch(M){"undefined"!==typeof window&&window.console&&(console.log("There was an error collecting entropy from the browser:"),console.log(M))}
sjcl.json={defaults:{v:1,iter:1E3,ks:128,ts:64,mode:"ccm",adata:"",cipher:"aes"},Y:function(a,b,c,d){c=c||{};d=d||{};var e=sjcl.json,f=e.e({iv:sjcl.random.randomWords(4,0)},e.defaults),g;e.e(f,c);c=f.adata;"string"===typeof f.salt&&(f.salt=sjcl.codec.base64.toBits(f.salt));"string"===typeof f.iv&&(f.iv=sjcl.codec.base64.toBits(f.iv));(!sjcl.mode[f.mode]||!sjcl.cipher[f.cipher]||"string"===typeof a&&100>=f.iter||64!==f.ts&&96!==f.ts&&128!==f.ts||128!==f.ks&&192!==f.ks&&0x100!==f.ks||2>f.iv.length||4<
f.iv.length)&&q(new sjcl.exception.invalid("json encrypt: invalid parameters"));"string"===typeof a?(g=sjcl.misc.cachedPbkdf2(a,f),a=g.key.slice(0,f.ks/32),f.salt=g.salt):sjcl.ecc&&a instanceof sjcl.ecc.elGamal.publicKey&&(g=a.kem(),f.kemtag=g.tag,a=g.key.slice(0,f.ks/32));"string"===typeof b&&(b=sjcl.codec.utf8String.toBits(b));"string"===typeof c&&(f.adata=c=sjcl.codec.utf8String.toBits(c));g=new sjcl.cipher[f.cipher](a);e.e(d,f);d.key=a;f.ct=sjcl.mode[f.mode].encrypt(g,b,f.iv,c,f.ts);return f},
encrypt:function(a,b,c,d){var e=sjcl.json,f=e.Y.apply(e,arguments);return e.encode(f)},X:function(a,b,c,d){c=c||{};d=d||{};var e=sjcl.json;b=e.e(e.e(e.e({},e.defaults),b),c,!0);var f,g;f=b.adata;"string"===typeof b.salt&&(b.salt=sjcl.codec.base64.toBits(b.salt));"string"===typeof b.iv&&(b.iv=sjcl.codec.base64.toBits(b.iv));(!sjcl.mode[b.mode]||!sjcl.cipher[b.cipher]||"string"===typeof a&&100>=b.iter||64!==b.ts&&96!==b.ts&&128!==b.ts||128!==b.ks&&192!==b.ks&&0x100!==b.ks||!b.iv||2>b.iv.length||4<b.iv.length)&&
q(new sjcl.exception.invalid("json decrypt: invalid parameters"));"string"===typeof a?(g=sjcl.misc.cachedPbkdf2(a,b),a=g.key.slice(0,b.ks/32),b.salt=g.salt):sjcl.ecc&&a instanceof sjcl.ecc.elGamal.secretKey&&(a=a.unkem(sjcl.codec.base64.toBits(b.kemtag)).slice(0,b.ks/32));"string"===typeof f&&(f=sjcl.codec.utf8String.toBits(f));g=new sjcl.cipher[b.cipher](a);f=sjcl.mode[b.mode].decrypt(g,b.ct,b.iv,f,b.ts);e.e(d,b);d.key=a;return 1===c.raw?f:sjcl.codec.utf8String.fromBits(f)},decrypt:function(a,b,
c,d){var e=sjcl.json;return e.X(a,e.decode(b),c,d)},encode:function(a){var b,c="{",d="";for(b in a)if(a.hasOwnProperty(b))switch(b.match(/^[a-z0-9]+$/i)||q(new sjcl.exception.invalid("json encode: invalid property name")),c+=d+'"'+b+'":',d=",",typeof a[b]){case "number":case "boolean":c+=a[b];break;case "string":c+='"'+escape(a[b])+'"';break;case "object":c+='"'+sjcl.codec.base64.fromBits(a[b],0)+'"';break;default:q(new sjcl.exception.bug("json encode: unsupported type"))}return c+"}"},decode:function(a){a=
a.replace(/\s/g,"");a.match(/^\{.*\}$/)||q(new sjcl.exception.invalid("json decode: this isn't json!"));a=a.replace(/^\{|\}$/g,"").split(/,/);var b={},c,d;for(c=0;c<a.length;c++)(d=a[c].match(/^\s*(?:(["']?)([a-z][a-z0-9]*)\1)\s*:\s*(?:(-?\d+)|"([a-z0-9+\/%*_.@=\-]*)"|(true|false))$/i))||q(new sjcl.exception.invalid("json decode: this isn't json!")),d[3]?b[d[2]]=parseInt(d[3],10):d[4]?b[d[2]]=d[2].match(/^(ct|adata|salt|iv)$/)?sjcl.codec.base64.toBits(d[4]):unescape(d[4]):d[5]&&(b[d[2]]="true"===
d[5]);return b},e:function(a,b,c){a===s&&(a={});if(b===s)return a;for(var d in b)b.hasOwnProperty(d)&&(c&&(a[d]!==s&&a[d]!==b[d])&&q(new sjcl.exception.invalid("required parameter overridden")),a[d]=b[d]);return a},fa:function(a,b){var c={},d;for(d in a)a.hasOwnProperty(d)&&a[d]!==b[d]&&(c[d]=a[d]);return c},ea:function(a,b){var c={},d;for(d=0;d<b.length;d++)a[b[d]]!==s&&(c[b[d]]=a[b[d]]);return c}};sjcl.encrypt=sjcl.json.encrypt;sjcl.decrypt=sjcl.json.decrypt;sjcl.misc.ca={};
sjcl.misc.cachedPbkdf2=function(a,b){var c=sjcl.misc.ca,d;b=b||{};d=b.iter||1E3;c=c[a]=c[a]||{};d=c[d]=c[d]||{firstSalt:b.salt&&b.salt.length?b.salt.slice(0):sjcl.random.randomWords(2,0)};c=b.salt===s?d.firstSalt:b.salt;d[c]=d[c]||sjcl.misc.pbkdf2(a,c,b.iter);return{key:d[c].slice(0),salt:c.slice(0)}};

/*eslint-env amd*/
define(
  'authentication',['sjcl'], function (sjcl) {
    

    var Authentication = function (options) {
      options = options || {};
      this.getRecord = options.getRecord || null;
      this.setRecord = options.setRecord || null;
    };

    Authentication.prototype.getCurrent = function (onSuccess, onError) {
      this.getRecord(function(err, data) {
        if (err) {
          return onError(err);
        }

        if (!data) {
          return onSuccess(null);
        }

        if (data.expiry < new Date()) {
          return onSuccess(null);
        }

        if (data.principal && data.expiry) {
          data = {
            principal: data.principal,
            expiry: data.expiry
          };
        }

        onSuccess(data);
      });
    };

    Authentication.prototype.setCurrent = function (data, onSuccess, onError) {
      if (!data.principal || !data.credential || !data.expiry) {
        return onError(new Error('Missing required attribute(s)'));
      }

      data.credential = sjcl.codec.hex.fromBits(sjcl.hash.sha256.hash(data.credential));

      this.setRecord(data, function () {
        onSuccess();
      });
    };

    Authentication.prototype.authenticate = function (data, onSuccess, onError) {
      if (!data.principal || !data.credential) {
        return onError(new Error('Missing required attribute(s)'));
      }

      var hashedCredential = sjcl.codec.hex.fromBits(sjcl.hash.sha256.hash(data.credential));

      this.getRecord(function (err, cached) {
        if (err) {
          return onError(err);
        }

        if (!cached) {
          return onSuccess(null);
        }

        if (cached.expiry < new Date()) {
          return onSuccess(null);
        }

        if (data.principal === cached.principal &&
          hashedCredential === cached.credential) {
            onSuccess({
              principal: cached.principal,
              expiry: cached.expiry
            });
          }
      });
    };

    return Authentication;
  }
);

define(
  'main',['model-application', 'authentication'],
  function (app, Auth) {
    

    function start() {
      // AJAX Default Options
      $.ajaxPrefilter(function (options, originalOptions, jqXHR) {
        jqXHR.setRequestHeader('X-Blink-Config',
          JSON.stringify(window.BMP.BIC.siteVars));
      });

      window.BMP.Authentication = new Auth();

      require(['router', 'auth']);
    }

    // Delay the app for Cordova
    function init() {
      if (window.BMP.BlinkGap.isHere()) {
        window.BMP.BlinkGap.whenReady().then(start, start);
      } else {
        start();
      }
    }

    // Save traditional sync method as ajaxSync
    Backbone.ajaxSync = Backbone.sync;

    // New sync method
    Backbone.dataSync = function (method, model, options) {
      var data, promise;
      data = model.data || model.collection.data;

      switch (method) {
      case 'read':
        promise = model.id !== undefined ? data.read(model) : data.readAll();
        break;
      case 'create':
        promise = data.create(model);
        break;
      case 'update':
        promise = data.update(model);
        break;
      case 'patch':
        promise = data.update(model);
        break;
      case 'delete':
        promise = data.delete(model);
        break;
      default:
        promise = Promise.reject(new Error('unknown method'));
      }

      promise.then(function (response) {
        if (options.success) {
          options.success(response);
        }
      }, function (response) {
        if (options.error) {
          options.error(response);
        }
      });

      model.trigger('request', model, promise, options);

      return promise;
    };

    // Fallback to traditional sync when not specified
    Backbone.getSyncMethod = function (model) {
      if (model.data || model.collection && model.collection.data) {
        return Backbone.dataSync;
      }
      return Backbone.ajaxSync;
    };

    // Hook Backbone.sync up to the data layer
    Backbone.sync = function (method, model, options) {
      return Backbone.getSyncMethod(model).apply(this, [method, model, options]);
    };

    init();

    return app; // export BMP.BIC
  }
);

/**
 * @license RequireJS text 2.0.12 Copyright (c) 2010-2014, The Dojo Foundation All Rights Reserved.
 * Available via the MIT or new BSD license.
 * see: http://github.com/requirejs/text for details
 */
/*jslint regexp: true */
/*global require, XMLHttpRequest, ActiveXObject,
  define, window, process, Packages,
  java, location, Components, FileUtils */

define('text',['module'], function (module) {
    

    var text, fs, Cc, Ci, xpcIsWindows,
        progIds = ['Msxml2.XMLHTTP', 'Microsoft.XMLHTTP', 'Msxml2.XMLHTTP.4.0'],
        xmlRegExp = /^\s*<\?xml(\s)+version=[\'\"](\d)*.(\d)*[\'\"](\s)*\?>/im,
        bodyRegExp = /<body[^>]*>\s*([\s\S]+)\s*<\/body>/im,
        hasLocation = typeof location !== 'undefined' && location.href,
        defaultProtocol = hasLocation && location.protocol && location.protocol.replace(/\:/, ''),
        defaultHostName = hasLocation && location.hostname,
        defaultPort = hasLocation && (location.port || undefined),
        buildMap = {},
        masterConfig = (module.config && module.config()) || {};

    text = {
        version: '2.0.12',

        strip: function (content) {
            //Strips <?xml ...?> declarations so that external SVG and XML
            //documents can be added to a document without worry. Also, if the string
            //is an HTML document, only the part inside the body tag is returned.
            if (content) {
                content = content.replace(xmlRegExp, "");
                var matches = content.match(bodyRegExp);
                if (matches) {
                    content = matches[1];
                }
            } else {
                content = "";
            }
            return content;
        },

        jsEscape: function (content) {
            return content.replace(/(['\\])/g, '\\$1')
                .replace(/[\f]/g, "\\f")
                .replace(/[\b]/g, "\\b")
                .replace(/[\n]/g, "\\n")
                .replace(/[\t]/g, "\\t")
                .replace(/[\r]/g, "\\r")
                .replace(/[\u2028]/g, "\\u2028")
                .replace(/[\u2029]/g, "\\u2029");
        },

        createXhr: masterConfig.createXhr || function () {
            //Would love to dump the ActiveX crap in here. Need IE 6 to die first.
            var xhr, i, progId;
            if (typeof XMLHttpRequest !== "undefined") {
                return new XMLHttpRequest();
            } else if (typeof ActiveXObject !== "undefined") {
                for (i = 0; i < 3; i += 1) {
                    progId = progIds[i];
                    try {
                        xhr = new ActiveXObject(progId);
                    } catch (e) {}

                    if (xhr) {
                        progIds = [progId];  // so faster next time
                        break;
                    }
                }
            }

            return xhr;
        },

        /**
         * Parses a resource name into its component parts. Resource names
         * look like: module/name.ext!strip, where the !strip part is
         * optional.
         * @param {String} name the resource name
         * @returns {Object} with properties "moduleName", "ext" and "strip"
         * where strip is a boolean.
         */
        parseName: function (name) {
            var modName, ext, temp,
                strip = false,
                index = name.indexOf("."),
                isRelative = name.indexOf('./') === 0 ||
                             name.indexOf('../') === 0;

            if (index !== -1 && (!isRelative || index > 1)) {
                modName = name.substring(0, index);
                ext = name.substring(index + 1, name.length);
            } else {
                modName = name;
            }

            temp = ext || modName;
            index = temp.indexOf("!");
            if (index !== -1) {
                //Pull off the strip arg.
                strip = temp.substring(index + 1) === "strip";
                temp = temp.substring(0, index);
                if (ext) {
                    ext = temp;
                } else {
                    modName = temp;
                }
            }

            return {
                moduleName: modName,
                ext: ext,
                strip: strip
            };
        },

        xdRegExp: /^((\w+)\:)?\/\/([^\/\\]+)/,

        /**
         * Is an URL on another domain. Only works for browser use, returns
         * false in non-browser environments. Only used to know if an
         * optimized .js version of a text resource should be loaded
         * instead.
         * @param {String} url
         * @returns Boolean
         */
        useXhr: function (url, protocol, hostname, port) {
            var uProtocol, uHostName, uPort,
                match = text.xdRegExp.exec(url);
            if (!match) {
                return true;
            }
            uProtocol = match[2];
            uHostName = match[3];

            uHostName = uHostName.split(':');
            uPort = uHostName[1];
            uHostName = uHostName[0];

            return (!uProtocol || uProtocol === protocol) &&
                   (!uHostName || uHostName.toLowerCase() === hostname.toLowerCase()) &&
                   ((!uPort && !uHostName) || uPort === port);
        },

        finishLoad: function (name, strip, content, onLoad) {
            content = strip ? text.strip(content) : content;
            if (masterConfig.isBuild) {
                buildMap[name] = content;
            }
            onLoad(content);
        },

        load: function (name, req, onLoad, config) {
            //Name has format: some.module.filext!strip
            //The strip part is optional.
            //if strip is present, then that means only get the string contents
            //inside a body tag in an HTML string. For XML/SVG content it means
            //removing the <?xml ...?> declarations so the content can be inserted
            //into the current doc without problems.

            // Do not bother with the work if a build and text will
            // not be inlined.
            if (config && config.isBuild && !config.inlineText) {
                onLoad();
                return;
            }

            masterConfig.isBuild = config && config.isBuild;

            var parsed = text.parseName(name),
                nonStripName = parsed.moduleName +
                    (parsed.ext ? '.' + parsed.ext : ''),
                url = req.toUrl(nonStripName),
                useXhr = (masterConfig.useXhr) ||
                         text.useXhr;

            // Do not load if it is an empty: url
            if (url.indexOf('empty:') === 0) {
                onLoad();
                return;
            }

            //Load the text. Use XHR if possible and in a browser.
            if (!hasLocation || useXhr(url, defaultProtocol, defaultHostName, defaultPort)) {
                text.get(url, function (content) {
                    text.finishLoad(name, parsed.strip, content, onLoad);
                }, function (err) {
                    if (onLoad.error) {
                        onLoad.error(err);
                    }
                });
            } else {
                //Need to fetch the resource across domains. Assume
                //the resource has been optimized into a JS module. Fetch
                //by the module name + extension, but do not include the
                //!strip part to avoid file system issues.
                req([nonStripName], function (content) {
                    text.finishLoad(parsed.moduleName + '.' + parsed.ext,
                                    parsed.strip, content, onLoad);
                });
            }
        },

        write: function (pluginName, moduleName, write, config) {
            if (buildMap.hasOwnProperty(moduleName)) {
                var content = text.jsEscape(buildMap[moduleName]);
                write.asModule(pluginName + "!" + moduleName,
                               "define(function () { return '" +
                                   content +
                               "';});\n");
            }
        },

        writeFile: function (pluginName, moduleName, req, write, config) {
            var parsed = text.parseName(moduleName),
                extPart = parsed.ext ? '.' + parsed.ext : '',
                nonStripName = parsed.moduleName + extPart,
                //Use a '.js' file name so that it indicates it is a
                //script that can be loaded across domains.
                fileName = req.toUrl(parsed.moduleName + extPart) + '.js';

            //Leverage own load() method to load plugin value, but only
            //write out values that do not have the strip argument,
            //to avoid any potential issues with ! in file names.
            text.load(nonStripName, req, function (value) {
                //Use own write() method to construct full module value.
                //But need to create shell that translates writeFile's
                //write() to the right interface.
                var textWrite = function (contents) {
                    return write(fileName, contents);
                };
                textWrite.asModule = function (moduleName, contents) {
                    return write.asModule(moduleName, fileName, contents);
                };

                text.write(pluginName, nonStripName, textWrite, config);
            }, config);
        }
    };

    if (masterConfig.env === 'node' || (!masterConfig.env &&
            typeof process !== "undefined" &&
            process.versions &&
            !!process.versions.node &&
            !process.versions['node-webkit'])) {
        //Using special require.nodeRequire, something added by r.js.
        fs = require.nodeRequire('fs');

        text.get = function (url, callback, errback) {
            try {
                var file = fs.readFileSync(url, 'utf8');
                //Remove BOM (Byte Mark Order) from utf8 files if it is there.
                if (file.indexOf('\uFEFF') === 0) {
                    file = file.substring(1);
                }
                callback(file);
            } catch (e) {
                if (errback) {
                    errback(e);
                }
            }
        };
    } else if (masterConfig.env === 'xhr' || (!masterConfig.env &&
            text.createXhr())) {
        text.get = function (url, callback, errback, headers) {
            var xhr = text.createXhr(), header;
            xhr.open('GET', url, true);

            //Allow plugins direct access to xhr headers
            if (headers) {
                for (header in headers) {
                    if (headers.hasOwnProperty(header)) {
                        xhr.setRequestHeader(header.toLowerCase(), headers[header]);
                    }
                }
            }

            //Allow overrides specified in config
            if (masterConfig.onXhr) {
                masterConfig.onXhr(xhr, url);
            }

            xhr.onreadystatechange = function (evt) {
                var status, err;
                //Do not explicitly handle errors, those should be
                //visible via console output in the browser.
                if (xhr.readyState === 4) {
                    status = xhr.status || 0;
                    if (status > 399 && status < 600) {
                        //An http 4xx or 5xx error. Signal an error.
                        err = new Error(url + ' HTTP status: ' + status);
                        err.xhr = xhr;
                        if (errback) {
                            errback(err);
                        }
                    } else {
                        callback(xhr.responseText);
                    }

                    if (masterConfig.onXhrComplete) {
                        masterConfig.onXhrComplete(xhr, url);
                    }
                }
            };
            xhr.send(null);
        };
    } else if (masterConfig.env === 'rhino' || (!masterConfig.env &&
            typeof Packages !== 'undefined' && typeof java !== 'undefined')) {
        //Why Java, why is this so awkward?
        text.get = function (url, callback) {
            var stringBuffer, line,
                encoding = "utf-8",
                file = new java.io.File(url),
                lineSeparator = java.lang.System.getProperty("line.separator"),
                input = new java.io.BufferedReader(new java.io.InputStreamReader(new java.io.FileInputStream(file), encoding)),
                content = '';
            try {
                stringBuffer = new java.lang.StringBuffer();
                line = input.readLine();

                // Byte Order Mark (BOM) - The Unicode Standard, version 3.0, page 324
                // http://www.unicode.org/faq/utf_bom.html

                // Note that when we use utf-8, the BOM should appear as "EF BB BF", but it doesn't due to this bug in the JDK:
                // http://bugs.sun.com/bugdatabase/view_bug.do?bug_id=4508058
                if (line && line.length() && line.charAt(0) === 0xfeff) {
                    // Eat the BOM, since we've already found the encoding on this file,
                    // and we plan to concatenating this buffer with others; the BOM should
                    // only appear at the top of a file.
                    line = line.substring(1);
                }

                if (line !== null) {
                    stringBuffer.append(line);
                }

                while ((line = input.readLine()) !== null) {
                    stringBuffer.append(lineSeparator);
                    stringBuffer.append(line);
                }
                //Make sure we return a JavaScript string and not a Java string.
                content = String(stringBuffer.toString()); //String
            } finally {
                input.close();
            }
            callback(content);
        };
    } else if (masterConfig.env === 'xpconnect' || (!masterConfig.env &&
            typeof Components !== 'undefined' && Components.classes &&
            Components.interfaces)) {
        //Avert your gaze!
        Cc = Components.classes;
        Ci = Components.interfaces;
        Components.utils['import']('resource://gre/modules/FileUtils.jsm');
        xpcIsWindows = ('@mozilla.org/windows-registry-key;1' in Cc);

        text.get = function (url, callback) {
            var inStream, convertStream, fileObj,
                readData = {};

            if (xpcIsWindows) {
                url = url.replace(/\//g, '\\');
            }

            fileObj = new FileUtils.File(url);

            //XPCOM, you so crazy
            try {
                inStream = Cc['@mozilla.org/network/file-input-stream;1']
                           .createInstance(Ci.nsIFileInputStream);
                inStream.init(fileObj, 1, 0, false);

                convertStream = Cc['@mozilla.org/intl/converter-input-stream;1']
                                .createInstance(Ci.nsIConverterInputStream);
                convertStream.init(inStream, "utf-8", inStream.available(),
                Ci.nsIConverterInputStream.DEFAULT_REPLACEMENT_CHARACTER);

                convertStream.readString(inStream.available(), readData);
                convertStream.close();
                inStream.close();
                callback(readData.value);
            } catch (e) {
                throw new Error((fileObj && fileObj.path || '') + ': ' + e);
            }
        };
    }
    return text;
});


define('text!template-interaction.mustache',[],function () { return '{{{header}}}\n<div data-role="content">\n  <style>\n  .ui-controlgroup-controls {\n    width: 100%;\n  }\n  </style>\n  {{{content}}}\n</div>\n{{{footer}}}\n';});


define('text!template-inputPrompt.mustache',[],function () { return '<form method="get">\n    {{{inputs}}}\n    <button type="submit" data-theme="a">Go</button>\n</form>\n';});


define('text!template-form-controls.mustache',[],function () { return '{{#pages}}\n<div id="FormPageCount" data-role="controlgroup" data-type="horizontal">\n  <a id="previousFormPage" data-role="button" data-icon="back" {{^previous}}class="ui-disable"{{/previous}} style="width: 32%" data-iconpos="left">&nbsp;</a>\n  <a data-role="button" style="width: 33%"><span id="currentPage">{{current}}</span> of <span id="totalPages">{{total}}</span></a>\n  <a id="nextFormPage" data-role="button" data-icon="forward" {{^next}}class="ui-disable"{{/next}} style="width: 32%" data-iconpos="right">&nbsp;</a>\n</div>\n{{/pages}}\n\n<div id="FormControls" data-role="controlgroup" data-type="horizontal" style="width: 100%;">\n    <a id="close" data-role="button" data-icon="delete" data-iconpos="top" style="width: 49%;">Close</a>\n    <a id="submit" data-role="button" data-icon="check" data-iconpos="top" style="width: 49%;">Submit</a>\n</div>\n\n<div id="closePopup" data-role="popup" data-dismissible="false" data-overlay-theme="a" data-theme="c">\n  <div data-role="header">\n    <h1>Close</h1>\n  </div>\n  <div data-role="content">\n    <h3>Are you sure you want to close this form?</h3>\n    <div data-role="controlgroup" data-type="horizontal" style="width: 100%;">\n      <a href="#" id="save" data-role="button" data-rel="save" style="width: 49%;">Save</a>\n      <a href="#" id="discard" data-role="button" data-rel="delete" style="width: 49%;">Discard</a>\n    </div>\n    <a data-role="button" data-rel="back">Cancel</a>\n  </div>\n</div>\n';});

define(
  'view-form-controls',['text!template-form-controls.mustache', 'model-application'],
  function (Template, app) {
    
    var FormControlView = Backbone.View.extend({

      events: {
        'click #FormControls #submit': 'formSubmit',
        'click #FormControls #close': 'formClose',
        'click #nextFormPage': 'nextFormPage',
        'click #previousFormPage': 'previousFormPage'
      },

      render: function () {
        var view, options;

        view = this;
        options = {};


        if (BlinkForms.current.get('pages').length > 1) {
          options.pages = {
            current: BlinkForms.current.get('pages').current.index() + 1,
            total: BlinkForms.current.get('pages').length
          };

          if (BlinkForms.current.get('pages').current.index() !== 0) {
            options.pages.previous = true;
          }

          if (BlinkForms.current.get('pages').current.index() !== BlinkForms.current.get('pages').length - 1) {
            options.pages.next = true;
          }
        }

        view.$el.html(Mustache.render(Template, options));
        $.mobile.activePage.trigger('pagecreate');

        return view;
      },

      nextFormPage: function () {
        var view, index;

        view = this;
        index = BlinkForms.current.get('pages').current.index();

        if (index < BlinkForms.current.get('pages').length - 1) {
          BlinkForms.current.get('pages').goto(index + 1);
        }

        view.render();
      },

      previousFormPage: function () {
        var view, index;

        view = this;
        index = BlinkForms.current.get('pages').current.index();

        if (index > 0) {
          BlinkForms.current.get('pages').goto(index - 1);
        }

        view.render();
      },

      formSubmit: function () {
        this.addToQueue('Pending');
      },

      formClose: function () {
        var that = this;
        $('#closePopup').popup({
          afteropen: function (event) {
            $(event.target).on('click', '#save', {view: that}, that.formSave);
            $(event.target).on('click', '#discard', {view: that}, that.formDiscard);
          },
          afterclose: function (event) {
            $(event.target).off('click', '#save');
            $(event.target).off('click', '#discard');
          }
        });
        $('#closePopup').popup('open');
      },

      formSave: function (e) {
        e.data.view.addToQueue('Draft');
        $('#closePopup').one('popupafterclose', function () {
          history.back();
        });
        $('#closePopup').popup('close');
      },

      formDiscard: function () {
        $('#closePopup').one('popupafterclose', function () {
          history.back();
        });
        $('#closePopup').popup('close');
      },

      addToQueue: function (status, supressQueue) {
        var view = this;
        var model;
        supressQueue = supressQueue || false;

        return new Promise(function (resolve, reject) {
          BlinkForms.current.data().then(function (data) {
            var modelAttrs;
            var options = {};

            options.success = function (updatedModel) {
              if (!supressQueue) {
                $(window).one('pagechange', function () {
                  if (!navigator.onLine || model.get('status') === 'Draft') {
                    app.view.pendingQueue();
                  } else {
                    model.once('processed', function () {
                      if (model.get('status') === 'Submitted') {
                        app.view.popup(model.get('result'));
                        model.destroy();
                      } else {
                        app.view.pendingQueue();
                      }
                    });
                    app.pending.processQueue();
                  }
                });

                if (window.BMP.BIC3.history.length === 0) {
                  window.BMP.BIC3.view.home();
                } else {
                  history.back();
                }
              }
              resolve(updatedModel);
            };

            options.error = reject;

            data._action = view.model.get('blinkFormAction');
            modelAttrs = {
              type: 'Form',
              status: status,
              name: view.model.get('blinkFormObjectName'),
              label: view.model.get('displayName'),
              action: view.model.get('blinkFormAction'),
              answerspaceid: app.get('dbid'),
              data: data
            };
            if (view.model.get('args')['args[pid]']) {
              model = app.pending.get(view.model.get('args')['args[pid]']);
              model.save(modelAttrs, options);
            } else {
              model = app.pending.create(modelAttrs, options);
            }
          });
        });
      }
    });

    return FormControlView;
  }
);

define(
  'view-form-action',['model-application', 'view-form-controls'],
  function (app, FormControls) {
    
    var FormActionView = Backbone.View.extend({
      id: 'ActiveFormContainer',

      render: function () {
        var view = this;

        BlinkForms.getDefinition(view.model.get('blinkFormObjectName'), view.model.get('blinkFormAction'))
          .then(function (definition) {
            var formRecord;

            BlinkForms.initialize(definition, view.model.get('blinkFormAction'));
            view.$el.append(BlinkForms.current.$form);
            view.subView = new FormControls({
              model: view.model
            });
            view.subView.render();
            view.$el.append(view.subView.$el);

            if (view.model.get('args')['args[id]']) {
              formRecord = app.formRecords.get(view.model.get('blinkFormObjectName') + '-' + view.model.get('args')['args[id]']);
              formRecord.populate(view.model.get('blinkFormAction'), function () {
                BlinkForms.current.setRecord(formRecord.get('record'));
                view.trigger('render');
              });
            } else if (view.model.get('args')['args[pid]']) {
              BlinkForms.current.setRecord(app.pending.get(view.model.get('args')['args[pid]']).get('data'));
              if (BlinkForms.current.getErrors) {
                BlinkForms.current.getErrors();
              }
              view.trigger('render');
            } else {
              view.trigger('render');
            }
          })
          .then(null, function (err) {
            window.console.log(err);
          });

        return view;
      }
    });

    return FormActionView;
  }
);


define('text!template-form-list.mustache',[],function () { return '<table data-role="table" data-mode="columntoggle" class="ui-responsive table-stroke">\n  <thead>\n    <tr>\n      {{#headers}}\n      <th>{{.}}</th>\n      <th>Action</th>\n      {{/headers}}\n    </tr>\n  </thead>\n  <tbody>\n    {{#content}}\n    <tr>\n      {{#contents}}\n      <td>{{{.}}}</td>\n      {{/contents}}\n      <td>\n        {{#interactions.edit}}<a interaction="{{interactions.edit}}" _id="{{id}}">Edit</a>{{/interactions.edit}}\n        {{#interactions.view}}<a interaction="{{interactions.view}}" _id="{{id}}">View</a>{{/interactions.view}}\n        {{#interactions.delete}}<a interaction="{{interactions.delete}}" _id="{{id}}">Delete</a>{{/interactions.delete}}\n      </td>\n    </tr>\n    {{/content}}\n    {{^content}}\n    <tr>\n      <th>No items on the remote server</th>\n    </tr>\n    {{/content}}\n  </tbody>\n</table>\n';});

define(
  'view-form-list',['text!template-form-list.mustache', 'model-application'],
  function (Template, app) {
    
    var FormListView = Backbone.View.extend({
      render: function () {
        var view = this;

        app.formRecords.pull(view.model.get('blinkFormObjectName')).then(
          function () {
            var templateData = {};
            templateData.headers = [];
            BlinkForms.getDefinition(view.model.get('blinkFormObjectName'), view.model.get('blinkFormAction')).then(function (definition) {
              var elements = [];
              _.each(definition._elements, function (value) {
                if (value.type !== 'subForm') {
                  elements.push(value.name);
                  templateData.headers.push(value.name);
                }
              });

              templateData.content = _.map(app.formRecords.models, function (value) {
                var record = {};

                record.id = value.get('id');
                record.contents = [];

                _.each(value.attributes.list, function (iv, ik) {
                  if (ik !== 'id' && ik !== '_id' && _.contains(elements, ik)) {
                    record.contents.push(iv);
                  }
                });

                return record;
              });

              templateData.interactions = {};
              templateData.interactions.edit = app.interactions.findWhere({
                blinkFormObjectName: view.model.get('blinkFormObjectName'),
                blinkFormAction: 'edit'
              }).id;
              templateData.interactions.view = app.interactions.findWhere({
                blinkFormObjectName: view.model.get('blinkFormObjectName'),
                blinkFormAction: 'view'
              }).id;
              templateData.interactions.delete = app.interactions.findWhere({
                blinkFormObjectName: view.model.get('blinkFormObjectName'),
                blinkFormAction: 'delete'
              }).id;

              view.$el.html(Mustache.render(Template, templateData));
              view.trigger('render');

            });
          },
          function () {
            view.$el.html('Cannot contact server');
            view.trigger('render');
          }
        );

        return view;
      }
    });

    return FormListView;
  }
);

define(
  'view-form',['view-form-action', 'view-form-list'],
  function (FormAction, FormList) {
    
    var FormView = Backbone.View.extend({
      render: function () {
        var view, action;

        view = this;
        action = view.model.get('blinkFormAction');

        if (action === 'list') {
          view.subView = new FormList({
            model: view.model
          });
        } else if (action === 'search') {
          view.subView = null;
        } else {
          if ($('#ActiveFormContainer').length > 0) {
            $('#ActiveFormContainer').attr('id', 'FormContainer');
          }
          view.subView = new FormAction({
            model: view.model
          });
        }

        view.listenToOnce(view.subView, 'render', function () {
          view.$el.append(view.subView.$el);
          view.trigger('render');
        });

        view.subView.render();

        return view;
      }
    });

    return FormView;
  }
);


define('text!template-category-list.mustache',[],function () { return '<ul data-role="listview">\n  {{#models}}\n  <li>\n    <a interaction="{{_id}}">\n      {{#displayName}}\n        {{displayName}}\n      {{/displayName}}\n      {{^displayName}}\n        {{_id}}\n      {{/displayName}}\n    </a>\n  </li>\n  {{/models}}\n</ul>\n';});


define('text!template-pending.mustache',[],function () { return '<div id="pendingPopup" data-role="popup">\n  <div data-role="header">\n    <h1>Pending Queue</h1>\n  </div>\n  <div id="pendingContent" data-role="content">\n    <ul data-role="listview">\n      {{#validationPresent}}<li data-role="list-divider">Failed Validation</li>{{/validationPresent}}\n      {{#validation}}\n      <li>\n        <div>\n          <h2>{{label}}</h2>\n          <div data-role="controlgroup" data-type="horizontal" style="width: 100%;">\n            <a class="clearPendingItem" _pid="{{_id}}" data-role="button" style="width: 49%;">Clear</a>\n            <a interaction="{{editInteraction}}" _pid="{{_id}}" data-role="button" style="width: 49%;">Edit</a>\n          </div>\n        </div>\n      </li>\n      {{/validation}}\n\n      <li data-role="list-divider">Pending</li>\n      {{#pending}}\n      <li>\n        <div>\n          <h2>{{label}}</h2>\n        </div>\n      </li>\n      {{/pending}}\n      {{#pendingPresent}}\n      <li>\n        <a id="submitPendingItems" href="#">Submit All</a>\n      </li>\n      {{/pendingPresent}}\n      {{^pending}}<li>No items pending transmission to server</li>{{/pending}}\n\n      <li data-role="list-divider">Draft</li>\n      {{#draft}}\n      <li>\n        <div>\n          <h2>{{label}}</h2>\n          <div data-role="controlgroup" data-type="horizontal" style="width: 100%;">\n            <a class="clearPendingItem" _pid="{{_id}}" data-role="button" style="width: 49%;">Clear</a>\n            <a interaction="{{editInteraction}}" _pid="{{_id}}" data-role="button" style="width: 49%;">Edit</a>\n          </div>\n        </div>\n      </li>\n      {{/draft}}\n      {{#draftPresent}}\n      <li>\n        <a id="clearPendingItemsConfirmation" href="#">Clear All</a>\n      </li>\n      {{/draftPresent}}\n      {{^draft}}<li>No items saved as draft.</li>{{/draft}}\n    </ul>\n  </div>\n</div>\n';});

define(
  'view-star',[],
  function () {
    
    var StarView = Backbone.View.extend({
      events: {
        'click': 'toggle'
      },

      initialize: function () {
        this.listenTo(this.model, 'change:state', this.render);
      },

      toggle: function (e) {
        e.preventDefault();
        this.model.toggle();
      },

      render: function () {
        if (this.model.get('state')) {
          this.$el.addClass('blink-star-on');
          this.$el.removeClass('blink-star-off');
        } else {
          this.$el.addClass('blink-star-off');
          this.$el.removeClass('blink-star-on');
        }
      }
    });

    return StarView;
  }
);


define('text!template-popup.mustache',[],function () { return '<div id="popup" data-role="popup">\n{{{contents}}}\n</div>\n\n';});


define('text!template-clear-confirmation-popup.mustache',[],function () { return '<div id="clearConfirmationPopup" data-role="popup">\n  <div data-role="header">\n    <h1>Clear All Drafts</h1>\n  </div>\n  <div data-role="content">\n    <h3>Are you sure you want to delete all drafts?</h3>\n    <div data-role="controlgroup" data-type="horizontal" style="width: 100%;">\n      <a href="#" id="clearPendingItems" data-role="button" style="width: 49%;">Delete</a>\n      <a href="#" data-role="button" data-rel="back" style="width: 49%;">Cancel</a>\n    </div>\n  </div>\n</div>\n';});

/*globals $:false*/
// UMD: https://github.com/umdjs/umd/blob/master/returnExports.js
(function (root, factory) {
  
  if (typeof define === 'function' && define.amd) {
    define('geolocation',[], factory);
  } else if (typeof exports === 'object') {
    module.exports = factory();
  } else {
    if (root.BMP) {
      root.BMP.geolocation = factory();
    } else {
      root.geolocation = factory();
    }
  }
}(this, function () {
  

  var api;

  var module = {

    setGeoLocation: function (geolocation) {
      api = geolocation;
    },

    getGeoLocation: function () {
      if (api && api.getCurrentPosition) {
        return api;
      }
      if (typeof navigator !== 'undefined' && navigator.geolocation &&
          navigator.geolocation.getCurrentPosition) {
        return navigator.geolocation;
      }
      return false;
    },

    clonePosition: function (position) {
      if (!position || typeof position !== 'object' || !position.coords || typeof position.coords !== 'object') {
        throw new TypeError('cannot clone non-Position object');
      }
      return {
        coords: {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          altitude: position.coords.altitude,
          accuracy: position.coords.accuracy,
          altitudeAccuracy: position.coords.altitudeAccuracy,
          heading: position.coords.heading,
          speed: position.coords.speed
        }
      };
    },

    DEFAULT_POSITION_OPTIONS: {
      enableHighAccuracy: true,
      maximumAge: 0, // fresh results each time
      timeout: 10 * 1000 // take no longer than 10 seconds
    },

    POSITION_OPTION_TYPES: {
      enableHighAccuracy: 'boolean',
      maximumAge: 'number',
      timeout: 'number'
    },

    mergePositionOptions: function (options) {
      var result;
      if (!options || typeof options !== 'object') {
        return module.DEFAULT_POSITION_OPTIONS;
      }
      result = {};
      Object.keys(module.POSITION_OPTION_TYPES).forEach(function (option) {
        var type = module.POSITION_OPTION_TYPES[option];
        var value = options[option];
        if (typeof options[option] === type && (type !== 'number' || !isNaN(value))) {
          result[option] = options[option];
        } else {
          result[option] = module.DEFAULT_POSITION_OPTIONS[option];
        }
      });
      return result;
    },

    requestCurrentPosition: function (onSuccess, onError, options) {
      var geolocation = module.getGeoLocation();
      if (!geolocation) {
        throw new Error('the current web engine does not support GeoLocation');
      }
      if (typeof onSuccess !== 'function') {
        throw new TypeError('getCurrentPosition(): 1st parameter must be a Function to handle success');
      }
      if (typeof onError !== 'function') {
        throw new TypeError('getCurrentPosition(): 2nd parameter must be a Function to handle error');
      }
      options = module.mergePositionOptions(options);
      return geolocation.getCurrentPosition(function (position) {
        onSuccess(module.clonePosition(position));
      }, onError, options);
    },

    getPromiseConstructor: function () {
      if (typeof Promise !== 'undefined') {
        return Promise;
      }
      if (typeof $ !== 'undefined' && $.Deferred) {
        return $.Deferred;
      }
      return false;
    },

    getCurrentPosition: function (onSuccess, onError, options) {
      var P = module.getPromiseConstructor();
      if (P) {
        return new P(function (resolve, reject) {
          module.requestCurrentPosition(function (position) {
            if (typeof onSuccess === 'function') {
              onSuccess(position);
            }
            resolve(position);
          }, function (err) {
            if (typeof onError === 'function') {
              onError(err);
            }
            reject(err);
          }, options);
        });
      }
      return module.requestCurrentPosition(onSuccess, onError, options);
    }

  };

  return module;
}));

/*globals google:false, geolocation:false */
define(
  'view-interaction',['text!template-interaction.mustache', 'text!template-inputPrompt.mustache', 'view-form', 'model-application', 'text!template-category-list.mustache', 'model-star', 'text!template-pending.mustache', 'view-star', 'text!template-popup.mustache', 'text!template-clear-confirmation-popup.mustache', 'geolocation'],
  function (Template, inputPromptTemplate, FormView, app, categoryTemplate, StarModel, pendingTemplate, StarView, popupTemplate, clearConfirmationPopupTemplate, geolocation) {
    

    var InteractionView = Backbone.View.extend({

      initialize: function () {
        $('body').append(this.$el);
        window.BMP.BIC.view = this;

        // this.$el.once('pageremove', function () {
        //   console.log('Backbone view cleanup');

        // })
      },

      events: {
        // Old Blink Link Shortcut Methods
        'click [keyword]': 'blinklink',
        'click [interaction]': 'blinklink',
        'click [category]': 'blinklink',
        'click [masterCategory]': 'blinklink',
        'click [back]': 'back',
        'click [home]': 'home',
        'click [login]': 'blinklink',
        'click [pending]': 'pendingQueue',

        // Form Actions
        'click #queue': 'pendingQueue',
        'click .clearPendingItem': 'clearPendingItem',
        'click #submitPendingItems': 'submitPendingItems',
        'click #clearPendingItems': 'clearPendingItems',
        'click #clearPendingItemsConfirmation': 'clearPendingItemsConfirmation',

        // Destroy
        'pageremove': 'destroy'
      },

      attributes: {
        'data-role': 'page'
      },

      blinklink: function (e) {
        var $element;
        var location;
        var attributes = '';
        var first = true;
        var count;
        var path;
        var pathParts;

        e.preventDefault();

        if (e.target.tagName !== 'A') {
          $element = $(e.target).parents('a');
        } else {
          $element = $(e.target);
        }

        location = '';
        if ($element.attr('keyword')) {
          location = $element.attr('keyword');
        } else if ($element.attr('interaction')) {
          location = $element.attr('interaction');
        } else if ($element.attr('category')) {
          location = $element.attr('category');
        } else if ($element.attr('masterCategory')) {
          location = $element.attr('masterCategory');
        } else if ($element.attr('home') === '') {
          location = app.get('siteName');
        } else if ($element.attr('login') === '') {
          if (app.has('loginAccess') && app.has('loginUseInteractions') && app.has('loginUseInteractions') && app.has('loginPromptInteraction')) {
            location = app.get('loginPromptInteraction');
          } else {
            location = app.get('siteName');
          }
        }

        for (count = 0; count < $element[0].attributes.length; count = count + 1) {
          if ($element[0].attributes[count].name.substr(0, 1) === '_') {
            if (!first) {
              attributes += '&args[' + $element[0].attributes[count].name.substr(1) + ']=' + $element[0].attributes[count].value;
            } else {
              first = false;
              attributes = '/?args[' + $element[0].attributes[count].name.substr(1) + ']=' + $element[0].attributes[count].value;
            }
          }
        }

        path = '';
        pathParts = $.mobile.path.parseLocation().pathname;
        if (window.cordova && window.cordova.offline && window.cordova.offline.available && pathParts.indexOf(window.cordova.offline.filePathPrex) !== -1) {
          // Remove file path
          pathParts = pathParts.substr(pathParts.indexOf(window.cordova.offline.filePathPrex) + window.cordova.offline.filePathPrex.length + 1);
          // Remove domain info
          pathParts = pathParts.substr(pathParts.indexOf('/'));
          // Remove file suffix
          pathParts = pathParts.substr(0, pathParts.indexOf('.'));
        }
        pathParts = pathParts.split('/');
        pathParts.shift();
        if (pathParts[pathParts.length - 1] === '') {
          pathParts.pop();
        }

        if (pathParts[0] === 'offlineData' && pathParts[1] === window.initialURLHashed) {
          pathParts.pop();
          pathParts[0] = window.BMP.BIC.siteVars.answerSpace.toLowerCase();
        }

        for (count = pathParts.length - 1; count !== -1; count = count - 1) {
          if (!app.interactions.get(pathParts[count].toLowerCase()).get('type') && path.indexOf(pathParts[count]) === -1 && path.indexOf(pathParts[count].toLowerCase()) === -1 && pathParts[count] !== location && pathParts[count] !== location.toLowerCase()) {
            if (path !== '') {
              path = pathParts[count] + '/' + path;
            } else {
              path = pathParts[count];
            }
          }
        }

        path = '/' + path;

        $.mobile.changePage(path + '/' + location + attributes);
      },

      back: function (e) {
        e.preventDefault();
        history.back();
      },

      home: function () {
        $.mobile.changePage('/' + app.get('siteName'));
      },

      render: function (data) {
        var form,
          rawform,
          inheritedAttributes = this.model.inherit({}),
          view = this;

        // Non-type specific
        if (_.has(inheritedAttributes, 'themeSwatch')) {
          this.$el.attr('data-theme', inheritedAttributes.themeSwatch);
        }

        // Input Prompt
        if (this.model.has('inputPrompt') && !this.model.has('args')) {
          rawform = this.model.get('inputPrompt');
          if (rawform.substr(0, 6) === '<form>') {
            form = rawform;
          } else {
            form = Mustache.render(inputPromptTemplate, {inputs: rawform});
          }
          this.$el.html(Mustache.render(Template, {
            header: inheritedAttributes.header,
            footer: inheritedAttributes.footer,
            content: form
          }));
          this.trigger('render');
        } else if (view.model.has('type') && view.model.get('type') === 'xslt') {
          // XSLT
          view.model.once('change:content', function () {
            if (typeof view.model.get('content') === 'object') {
              view.$el.html(Mustache.render(Template, {
                header: inheritedAttributes.header,
                footer: inheritedAttributes.footer,
                content: ''
              }));
              view.$el.children('[data-role=content]')[0].appendChild(view.model.get('content'));
              view.processStars();
              view.trigger('render');
            } else if (typeof view.model.get('content') === 'string') {
              view.$el.html(Mustache.render(Template, {
                header: inheritedAttributes.header,
                footer: inheritedAttributes.footer,
                content: view.model.get('content')
              }));
              view.trigger('render');
            } else {
              view.$el.html(Mustache.render(Template, {
                header: inheritedAttributes.header,
                footer: inheritedAttributes.footer,
                content: 'Unknown error rendering XSLT interaction.'
              }));
              view.trigger('render');
            }
          });
          this.model.performXSLT();
        } else if (this.model.has('type') && this.model.get('type') === 'form') {
          if ($('#ActiveFormContainer').length > 0) {
            $('#ActiveFormContainer').attr('id', 'FormContainer');
          }

          // Form
          view.$el.html(Mustache.render(Template, {
            header: inheritedAttributes.header,
            footer: inheritedAttributes.footer
          }));

          view.subView = new FormView({
            model: view.model,
            el: view.$el.children('[data-role="content"]')
          });

          view.listenToOnce(view.subView, 'render', function () {
            view.trigger('render');
          });

          view.subView.render();

        } else if (this.model.id.toLowerCase() === window.BMP.BIC.siteVars.answerSpace.toLowerCase()) {
          // Home Screen
          view.$el.html(Mustache.render(Template, {
            header: inheritedAttributes.header,
            footer: inheritedAttributes.footer,
            content: Mustache.render(categoryTemplate, {
              models: view.model.get('interactionList'),
              path: data.dataUrl.substr(-1) === '/' ? data.dataUrl : data.dataUrl + '/'
            })
          }));
          view.trigger('render');
        } else if (!this.model.has('type')) {
          // Category
          view.$el.html(Mustache.render(Template, {
            header: inheritedAttributes.header,
            footer: inheritedAttributes.footer,
            content: Mustache.render(categoryTemplate, {
              models: _.map(_.filter(app.interactions.models, function (value) {
                return value.get('display') !== 'hide' && _.filter(value.get('tags'), function (element) {
                  return element === 'nav-' + this.model.id.toLowerCase();
                }, this).length > 0;
              }, view), function (value) {
                return value.attributes;
              }),
              path: data.dataUrl.substr(-1) === '/' ? data.dataUrl : data.dataUrl + '/'
            })
          }));
          view.trigger('render');
        } else if (this.model.get('type') === 'message') {
          this.$el.html(Mustache.render(Template, {
            header: inheritedAttributes.header,
            footer: inheritedAttributes.footer,
            content: inheritedAttributes.message
          }));
          this.trigger('render');
        } else {
          // MADL, others
          this.$el.html(Mustache.render(Template, inheritedAttributes));
          if (this.model.has('content')) {
            this.blinkAnswerMessages();
            this.maps();
            this.processStars();
          }
          this.trigger('render');
        }
        return this;
      },

      maps: function () {
        var mapDiv = this.$el.find('[class=googlemap]'), script;

        if (mapDiv.length !== 0) {
          //this.$el.append('<style type='text/css'>.googlemap { width: 100%; height: 360px; }</style>');
          //this.$el.append('<script src='/_BICv3_/js/gMaps.js'></script>');
          if (mapDiv.attr('data-marker-title') !== undefined) {
          // Address Map
            window.BMP.BIC.mapCallback = this.addressMap;
          } else if (mapDiv.attr('data-kml') !== undefined) {
          // KML Map
            window.BMP.BIC.MapCallback = this.kmlMap;
          } else if (mapDiv.attr('data-map-action') !== undefined) {
          // Directions Map
            window.BMP.BIC.mapCallback = this.directionsMap;
          } else {
          // Basic Map
            window.BMP.BIC.mapCallback = this.basicMap;
          }

          if (window.google === undefined) {
            script = document.createElement('script');
            script.type = 'text/javascript';
            script.src = 'https://maps.googleapis.com/maps/api/js?v=3&sensor=true&callback=window.BMP.BIC.mapCallback';
            $('body').append(script);
          } else {
            window.BMP.BIC.mapCallback();
          }
        }
      },

      blinkAnswerMessages: function (message) {
        var blinkAnswerMessage = this.model.get('content').match(/<!-- blinkAnswerMessage:\{.*\} -->/g);

        if (!message) {
          // First Pass - Extract content
          if ($.type(blinkAnswerMessage) === 'array') {
            _.each(blinkAnswerMessage, function (element) {
              this.blinkAnswerMessages(element.substring(24, element.length - 4));
            }, this);
          }
        } else {
          // Process a given message
          message = JSON.parse(message);
          if (typeof message.mojotarget === 'string') {
            if (typeof message.mojoxml === 'string') {
              // Add a DS
              app.datasuitcases.create({
                _id: message.mojotarget,
                data: message.mojoxml
              });
            } else if (message.mojodelete !== undefined) {
              // Remove a DS
              app.datasuitcases.remove(message.mojotarget);
            }
          }

          if (message.startype) {
            if (message.clearstars) {
              // Clear all stars?
              app.stars.clear(message.startype);
            }
            if ($.type(message.staroff) === 'array') {
              // Remove specific stars
              _.each(message.staroff, function (element) {
                if (app.stars.get(element)) {
                  app.stars.get(element.toString()).destroy();
                }
              }, this);
            }
            if ($.type(message.staron) === 'array') {
              // Add stars
              _.each(message.staron, function (element) {
                app.stars.create({
                  _id: element.toString(),
                  type: message.startype,
                  state: true
                });
              });
            }
          }
        }
      },

      pendingQueue: function () {
        //var el = $('#pendingContent');
        var pendingExtractor = function (status) {
          return _.map(app.pending.where({status: status}), function (pendingItem) {
            var pendingAttrs = _.clone(pendingItem.attributes);
            if (!pendingAttrs._id) {
              pendingAttrs._id = pendingItem.cid;
            }
            pendingAttrs.editInteraction = app.interactions.where({
              blinkFormObjectName: pendingItem.get('name'),
              blinkFormAction: pendingItem.get('action')
            });
            if (pendingAttrs.editInteraction && pendingAttrs.editInteraction.length > 0) {
              pendingAttrs.editInteraction = pendingAttrs.editInteraction[0].id;
            } else {
              pendingAttrs.editInteraction = null;
            }
            if (!pendingAttrs.label) {
              pendingAttrs.label = pendingAttrs.name;
            }
            return pendingAttrs;
          });
        };

        this.$el.append(Mustache.render(pendingTemplate, {
          pending: pendingExtractor('Pending'),
          pendingPresent: pendingExtractor('Pending').length > 0,
          draft: pendingExtractor('Draft'),
          draftPresent: pendingExtractor('Draft').length > 0,
          validation: pendingExtractor('Failed Validation'),
          validationPresent: pendingExtractor('Failed Validation').length > 0
        }));
        this.$el.trigger('pagecreate');
        $('#pendingPopup').one('popupafterclose', function () {
          $('#pendingPopup').remove();
        });
        $('#pendingPopup').popup('open');
      },

      clearPendingItem: function (e) {
        var $element, popup = $('#pendingPopup');

        if (e.target.tagName !== 'A') {
          $element = $(e.target).parents('a');
        } else {
          $element = $(e.target);
        }

        app.pending.get($element[0].attributes._pid.value).destroy();
        popup.popup('close');
      },

      submitPendingItems: function () {
        var popup = $('#pendingPopup');
        $.mobile.loading('show');
        app.pending.processQueue()
          .then(null, function () {
            return null;
          })
          .then(function () {
            popup.one('popupafterclose', function () {
              $.mobile.loading('hide');
            });
            popup.popup('close');
          });
      },

      clearPendingItems: function () {
        var items, popup = $('#clearConfirmationPopup'), i;
        items = app.pending.where({status: 'Draft'});
        for (i = 0; i < items.length; i = i + 1) {
          items[i].destroy();
        }
        popup.one('popupafterclose', function () {
          popup.remove();
        });
        popup.popup('close');
      },

      clearPendingItemsConfirmation: function () {
        var pendingPopup = $('#pendingPopup');

        pendingPopup.one('popupafterclose', function () {
          $('#clearConfirmationPopup').popup({
            afterclose: function () {
              $('#clearConfirmationPopup').remove();
            }
          });
          setInterval(function () {
            $('#clearConfirmationPopup').popup('open');
          }, 100);
        });

        this.$el.append(Mustache.render(clearConfirmationPopupTemplate, {}));
        this.$el.trigger('pagecreate');
        pendingPopup.popup('close');
      },

      popup: function (data) {
        this.$el.append(Mustache.render(popupTemplate, {
          contents: data
        }));
        this.$el.trigger('pagecreate');
        $('#popup').popup('open');
      },

      destroy: function () {
        this.remove();
      },

      processStars: function () {
        var elements = this.$el.find('.blink-starrable');
        if (elements) {
          elements.each(function (index, element) {
            var attrs,
              model = app.stars.get($(element).data('id')),
              star;
            if (!model) {
              attrs = $(element).data();
              attrs._id = attrs.id.toString();
              delete attrs.id;
              attrs.state = false;
              model = new StarModel(attrs);
            }
            star = new StarView({
              model: model,
              el: element
            });
            star.render();
          });
        }
      },



      basicMap: function () {
        var options, map, mapDiv = window.BMP.BIC3.view.$el.find('[class=googlemap]');

        options = {
          center: new google.maps.LatLng(mapDiv.attr('data-latitude'), mapDiv.attr('data-longitude')),
          zoom: parseInt(mapDiv.attr('data-zoom'), 10),
          mapTypeId: google.maps.MapTypeId[mapDiv.attr('data-type').toUpperCase()]
        };

        map = new google.maps.Map($('[class=\'googlemap\']')[0], options);

        $(document).bind('pageshow', function () {
          google.maps.event.trigger(map, 'resize');
          map.setCenter(new google.maps.LatLng(mapDiv.attr('data-latitude'), mapDiv.attr('data-longitude')));
        });
      },

      addressMap: function () {
        var geocoder, options, map, mapDiv = window.BMP.BIC3.view.$el.find('[class=googlemap]');

        geocoder = new google.maps.Geocoder();

        options = {
          address: mapDiv.attr('data-marker-title')
        };

        geocoder.geocode(options, function (results) {
          options = {
            center: results[0].geometry.location,
            zoom: parseInt(mapDiv.attr('data-zoom'), 10),
            mapTypeId: google.maps.MapTypeId[mapDiv.attr('data-type').toUpperCase()]
          };
          map = new google.maps.Map($('[class=\'googlemap\']')[0], options);
          $(document).bind('pageshow', function () {
            google.maps.event.trigger(map, 'resize');
            map.setCenter(results[0].geometry.location);
          });
        });
      },

      kmlMap: function () {
        var options, map, kml, mapDiv = window.BMP.BIC3.view.$el.find('[class=googlemap]');

        options = {
          center: new google.maps.LatLng(mapDiv.attr('data-latitude'), mapDiv.attr('data-longitude')),
          zoom: parseInt(mapDiv.attr('data-zoom'), 10),
          mapTypeId: google.maps.MapTypeId[mapDiv.attr('data-type').toUpperCase()]
        };

        map = new google.maps.Map($('[class=\'googlemap\']')[0], options);
        kml = new google.maps.KmlLayer(mapDiv.attr('data-kml'), {preserveViewport: true});
        kml.setMap(map);

        $(document).bind('pageshow', function () {
          google.maps.event.trigger(map, 'resize');
          map.setCenter(new google.maps.LatLng(mapDiv.attr('data-latitude'), mapDiv.attr('data-longitude')));
        });
      },

      directionsMap: function () {
        var options, map, directionsDisplay, directionsService, origin, destination, locationPromise, request, mapDiv;

        mapDiv = window.BMP.BIC3.view.$el.find('[class=googlemap]');

        directionsDisplay = new google.maps.DirectionsRenderer();
        directionsService = new google.maps.DirectionsService();

        options = {
          center: new google.maps.LatLng(-33.873658, 151.206915),
          zoom: 10,
          mapTypeId: google.maps.MapTypeId[mapDiv.attr('data-type').toUpperCase()]
        };

        map = new google.maps.Map($('[class=\'googlemap\']')[0], options);

        directionsDisplay.setPanel($('[class="googledirections"]')[0]);

        $(document).bind('pageshow', function () {
          google.maps.event.trigger(map, 'resize');
          directionsDisplay.setMap(map);
        });

        if (mapDiv.attr('data-destination-address') === undefined || mapDiv.attr('data-origin-address') === undefined) {
          // Set the origin from attributes or GPS
          locationPromise = window.BMP.BIC.getCurrentPosition();
          locationPromise.then(function (location) {
            if (mapDiv.attr('data-origin-address') === undefined) {
              origin = new google.maps.LatLng(location.latitude, location.longitude);
              destination = mapDiv.attr('data-destination-address');
            } else if (mapDiv.attr('data-destination-address') === undefined) {
              origin = mapDiv.attr('data-origin-address');
              destination = new google.maps.LatLng(location.latitude, location.longitude);
            }
            request = {
              origin: origin,
              destination: destination,
              travelMode: google.maps.TravelMode[mapDiv.attr('data-travelmode').toUpperCase()]
            };

            directionsService.route(request, function (result, status) {
              if (status === google.maps.DirectionsStatus.OK) {
                directionsDisplay.setDirections(result);
              }
            });
          });
        } else {
          request = {
            origin: mapDiv.attr('data-origin-address'),
            destination: mapDiv.attr('data-destination-address'),
            travelMode: google.maps.TravelMode[mapDiv.attr('data-travelmode').toUpperCase()]
          };

          directionsService.route(request, function (result, status) {
            if (status === google.maps.DirectionsStatus.OK) {
              directionsDisplay.setDirections(result);
            }
          });
        }

      }
    });

    window.BMP.geolocation = geolocation;

    window.BMP.BIC.getCurrentPosition = function (options) {
      return new Promise(function (resolve, reject) {
        window.BMP.geolocation.getCurrentPosition()
        .then(function (position) {
          if ($.type(position.coords) === 'object') {
            resolve(position.coords);
          } else {
            reject('GeoLocation error: blank location from browser / device');
          }
        }, function (error) {
          var string;
          switch (error.code) {
          case error.PERMISSION_DENIED:
            string = 'user has not granted permission';
            break;
          case error.PERMISSION_DENIED_TIMEOUT:
            string = 'user did not grant permission in time';
            break;
          case error.POSITION_UNAVAILABLE:
            string = 'unable to determine position';
            break;
          default:
            string = 'unknown error';
          }
          reject('GeoLocation error: ' + string);
        }, options);
      });
    };

    return InteractionView;
  }
);

define(
  'router',['model-application', 'view-interaction'],
  function (app, InteractionView) {
    
    var Router = Backbone.Router.extend({
      initialize: function () {
        BMP.FileInput.initialize();

        app.router = this;

        if (BMP.isBlinkGap) {
          $(document).on('pause', this.suspendApplication);
          $(document).on('resume', this.resumeApplication);
        }

        if (document.hidden !== undefined) {
          $(document).on('visibilitychange', function () {
            if (document.hidden) {
              app.router.suspendApplication();
            } else {
              app.router.resumeApplication();
            }
          });
        }

        $(document).on('pagebeforeload', function (e, data) {
          e.preventDefault();

          // keep track of history depth for forms post-submission behaviour
          window.BMP.BIC3.history.length += 1;

          $.mobile.loading('show');
          app.router.routeRequest(data);
        });

        Promise.resolve(app.datastore())
          .then(function () {
            return app.collections();
          })
          .then(function () {
            return app.setup();
          })
          .then(null, function () {
            return;
          })
          .then(function () {
            // Need to hang around until native offline is ready
            return new Promise(function (resolve, reject) {
              if (BMP.BlinkGap.isHere()) {
                BMP.BlinkGap.waitForOffline(
                  function () {
                    resolve();
                  },
                  function () {
                    reject();
                  }
                );
              } else {
                resolve();
              }
            });
          })
          .then(function () {
            return app.populate();
          })
          .then(null, function () {
            return;
          })
          .then(function () {
            return app.forms.download();
          })
          .then(null, function () {
            return;
          })
          .then(function () {
            return app.initialRender();
          })
          .then(null, function (err) {
            throw err;
          });
      },

      routeRequest: function (data) {
        var path = $.mobile.path.parseUrl(data.absUrl),
          model;

        if (BMP.BlinkGap.isOfflineReady() && path.hrefNoSearch.indexOf(window.cordova.offline.filePathPrex) !== -1) {
          // Remove file path
          path.pathname = path.hrefNoSearch.substr(path.hrefNoSearch.indexOf(window.cordova.offline.filePathPrex) + window.cordova.offline.filePathPrex.length + 1);
          // Remove domain info
          path.pathname = path.pathname.substr(path.pathname.indexOf('/'));
          // Remove file suffix
          path.pathname = path.pathname.substr(0, path.pathname.indexOf('.'));
        }

        app.whenPopulated()
          .then(null, function () {
            return null;
          })
          .then(function () {

            model = app.router.inheritanceChain(path.pathname);

            app.currentInteraction = model;

            app.router.parseArgs(path.search.substr(1), model);

            model.prepareForView(data).then(function (innerModel) {
              new InteractionView({
                tagName: 'div',
                model: innerModel
              }).once('render', function () {
                this.$el.attr('data-url', data.dataUrl);
                this.$el.attr('data-external-page', true);
                this.$el.one('pagecreate', $.mobile._bindPageRemove);
                data.deferred.resolve(data.absUrl, data.options, this.$el);
              }).render(data);
            }, function () {
              data.deferred.reject(data.absUrl, data.options);
              $.mobile.showPageLoadingMsg($.mobile.pageLoadErrorMessageTheme, $.mobile.pageLoadErrorMessage, true);
              setTimeout($.mobile.hidePageLoadingMsg, 1500);
            });
          });

      },

      inheritanceChain: function (data) {
        var path, parentModel, parent, usedPathItems;
        path = data.substr(1).toLowerCase().split('/').reverse();
        parent = path[path.length - 1];
        usedPathItems = [];

        if (path[0] === '') {
          path.shift();
        }

        if (path[0] === window.initialURLHashed && path[path.length - 1] === 'offlinedata') {
          path[0] = window.BMP.BIC.siteVars.answerSpace.toLowerCase();
          path.pop();
        }

        _.each(path, function (element, index) {
          if (!_.find(usedPathItems, function (id) {return id === element; })) {
            parentModel = app.interactions.get(element) || app.interactions.where({dbid: 'i' + element})[0] || null;
            if (parent && parentModel) {
              if (index !== path.length - 1) {
                parentModel.set({parent: parent});
                parent = parentModel.id;
              } else {
                parentModel.set({parent: 'app'});
                parent = 'app';
              }
            } else {
              throw 'Invalid Model Name';
            }
            usedPathItems.push(element);
          }
        }, this);

        return app.interactions.get(path[0]);
      },

      parseArgs: function (argString, model) {
        var args = argString.split('&'),
          tempargs,
          finalargs = {};

        _.each(args, function (element) {
          tempargs = element.split('=');
          if (tempargs[0].substr(0, 4) !== 'args') {
            tempargs[0] = 'args[' + tempargs[0] + ']';
          }
          finalargs[tempargs[0]] = tempargs[1];
        });

        if (finalargs) {
          model.set({args: finalargs});
        } else {
          model.set({args: null});
        }

        return this;
      },

      suspendApplication: function () {
        var url = $.mobile.path.parseLocation();
        // Store current URL
        localStorage.setItem('pauseURL', url.hrefNoHash);
        // Store form data, if applicable
        if (BMP.BIC.currentInteraction.get('type') === 'form') {
          if (app.currentInteraction.get('args')['args[pid]']) {
            app.view.subView.subView.subView.addToQueue('Draft', true);
          } else {
            app.view.subView.subView.subView.addToQueue('Draft', true)
              .then(function (model) {
                localStorage.setItem('pauseURL', url.hrefNoHash + '/?args[pid]=' + model.id);
              });
          }
        }
      },

      resumeApplication: function () {
        $.mobile.changePage(localStorage.getItem('pauseURL'));
        localStorage.removeItem('pauseURL');
      }
    });

    return new Router();
  }
);

define('auth',['facade'], function (facade) {
  

  var auth = window.BMP.Authentication;

  facade.subscribe('offlineAuthentication', 'storeAuth', function (authentication) {
    auth.setCurrent(authentication, function () {
      facade.publish('storeAuthSuccess');
    }, function () {
      facade.publish('storeAuthFailure');
    });
  });

  facade.subscribe('offlineAuthentication', 'authenticateAuth', function (authentication) {
    auth.authenticate(authentication, function () {
      facade.publish('loggedIn');
    }, function () {
      facade.publish('loggedOut');
    });
  });
});


require('main');
}));
require(['bic']);
