// AMD-detection borrowed from Kris Kowal's Q
// https://github.com/kriskowal/q/blob/master/q.js#L29
/*jslint sloppy:true*/ // don't force ES5 strict mode (need globals here)
(function (definition) {
  if (typeof define === "function" && define.amd) {
    // Require.JS
    define([
      'feature!promises',
      'jquery',
      'underscore',
      'backbone',
      'moment',
      'picker.date',
      'picker.time',
      'jquerymobile'
    ], definition);

  } else {
    // no Require.JS, no AMD modules
    definition(Promise, $, _, Backbone, moment);
  }
}(function(Promise, $, _, Backbone, moment) {
  
/*jslint sloppy:false*/ // let JSLint bug us again about ES5 strict mode
  // establish globals
  var BMP = window['BMP'] = window['BMP'] || {};
  BMP.Forms = BMP.Forms || {};

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
// Rivets.js
// version: 0.6.8
// author: Michael Richards
// license: MIT
(function() {
  var Rivets, bindMethod, unbindMethod, _ref,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; },
    __slice = [].slice,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  Rivets = {
    binders: {},
    components: {},
    formatters: {},
    adapters: {},
    config: {
      prefix: 'rv',
      templateDelimiters: ['{', '}'],
      rootInterface: '.',
      preloadData: true,
      handler: function(context, ev, binding) {
        return this.call(context, ev, binding.view.models);
      }
    }
  };

  if ('jQuery' in window) {
    _ref = 'on' in jQuery.prototype ? ['on', 'off'] : ['bind', 'unbind'], bindMethod = _ref[0], unbindMethod = _ref[1];
    Rivets.Util = {
      bindEvent: function(el, event, handler) {
        return jQuery(el)[bindMethod](event, handler);
      },
      unbindEvent: function(el, event, handler) {
        return jQuery(el)[unbindMethod](event, handler);
      },
      getInputValue: function(el) {
        var $el;
        $el = jQuery(el);
        if ($el.attr('type') === 'checkbox') {
          return $el.is(':checked');
        } else {
          return $el.val();
        }
      }
    };
  } else {
    Rivets.Util = {
      bindEvent: (function() {
        if ('addEventListener' in window) {
          return function(el, event, handler) {
            return el.addEventListener(event, handler, false);
          };
        }
        return function(el, event, handler) {
          return el.attachEvent('on' + event, handler);
        };
      })(),
      unbindEvent: (function() {
        if ('removeEventListener' in window) {
          return function(el, event, handler) {
            return el.removeEventListener(event, handler, false);
          };
        }
        return function(el, event, handler) {
          return el.detachEvent('on' + event, handler);
        };
      })(),
      getInputValue: function(el) {
        var o, _i, _len, _results;
        if (el.type === 'checkbox') {
          return el.checked;
        } else if (el.type === 'select-multiple') {
          _results = [];
          for (_i = 0, _len = el.length; _i < _len; _i++) {
            o = el[_i];
            if (o.selected) {
              _results.push(o.value);
            }
          }
          return _results;
        } else {
          return el.value;
        }
      }
    };
  }

  Rivets.View = (function() {
    function View(els, models, options) {
      var k, option, v, _base, _i, _len, _ref1, _ref2, _ref3;
      this.els = els;
      this.models = models;
      this.options = options != null ? options : {};
      this.update = __bind(this.update, this);
      this.publish = __bind(this.publish, this);
      this.sync = __bind(this.sync, this);
      this.unbind = __bind(this.unbind, this);
      this.bind = __bind(this.bind, this);
      this.select = __bind(this.select, this);
      this.build = __bind(this.build, this);
      this.componentRegExp = __bind(this.componentRegExp, this);
      this.bindingRegExp = __bind(this.bindingRegExp, this);
      if (!(this.els.jquery || this.els instanceof Array)) {
        this.els = [this.els];
      }
      _ref1 = ['config', 'binders', 'formatters', 'adapters'];
      for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
        option = _ref1[_i];
        this[option] = {};
        if (this.options[option]) {
          _ref2 = this.options[option];
          for (k in _ref2) {
            v = _ref2[k];
            this[option][k] = v;
          }
        }
        _ref3 = Rivets[option];
        for (k in _ref3) {
          v = _ref3[k];
          if ((_base = this[option])[k] == null) {
            _base[k] = v;
          }
        }
      }
      this.build();
    }

    View.prototype.bindingRegExp = function() {
      return new RegExp("^" + this.config.prefix + "-");
    };

    View.prototype.componentRegExp = function() {
      return new RegExp("^" + (this.config.prefix.toUpperCase()) + "-");
    };

    View.prototype.build = function() {
      var bindingRegExp, buildBinding, componentRegExp, el, parse, skipNodes, _i, _len, _ref1,
        _this = this;
      this.bindings = [];
      skipNodes = [];
      bindingRegExp = this.bindingRegExp();
      componentRegExp = this.componentRegExp();
      buildBinding = function(binding, node, type, declaration) {
        var context, ctx, dependencies, keypath, options, pipe, pipes;
        options = {};
        pipes = (function() {
          var _i, _len, _ref1, _results;
          _ref1 = declaration.split('|');
          _results = [];
          for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
            pipe = _ref1[_i];
            _results.push(pipe.trim());
          }
          return _results;
        })();
        context = (function() {
          var _i, _len, _ref1, _results;
          _ref1 = pipes.shift().split('<');
          _results = [];
          for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
            ctx = _ref1[_i];
            _results.push(ctx.trim());
          }
          return _results;
        })();
        keypath = context.shift();
        options.formatters = pipes;
        if (dependencies = context.shift()) {
          options.dependencies = dependencies.split(/\s+/);
        }
        return _this.bindings.push(new Rivets[binding](_this, node, type, keypath, options));
      };
      parse = function(node) {
        var attribute, attributes, binder, childNode, delimiters, identifier, n, parser, regexp, text, token, tokens, type, value, _i, _j, _k, _l, _len, _len1, _len2, _len3, _len4, _m, _ref1, _ref2, _ref3, _ref4, _ref5, _results;
        if (__indexOf.call(skipNodes, node) < 0) {
          if (node.nodeType === 3) {
            parser = Rivets.TextTemplateParser;
            if (delimiters = _this.config.templateDelimiters) {
              if ((tokens = parser.parse(node.data, delimiters)).length) {
                if (!(tokens.length === 1 && tokens[0].type === parser.types.text)) {
                  for (_i = 0, _len = tokens.length; _i < _len; _i++) {
                    token = tokens[_i];
                    text = document.createTextNode(token.value);
                    node.parentNode.insertBefore(text, node);
                    if (token.type === 1) {
                      buildBinding('TextBinding', text, null, token.value);
                    }
                  }
                  node.parentNode.removeChild(node);
                }
              }
            }
          } else if (componentRegExp.test(node.tagName)) {
            type = node.tagName.replace(componentRegExp, '').toLowerCase();
            _this.bindings.push(new Rivets.ComponentBinding(_this, node, type));
          } else if (node.attributes != null) {
            _ref1 = node.attributes;
            for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
              attribute = _ref1[_j];
              if (bindingRegExp.test(attribute.name)) {
                type = attribute.name.replace(bindingRegExp, '');
                if (!(binder = _this.binders[type])) {
                  _ref2 = _this.binders;
                  for (identifier in _ref2) {
                    value = _ref2[identifier];
                    if (identifier !== '*' && identifier.indexOf('*') !== -1) {
                      regexp = new RegExp("^" + (identifier.replace('*', '.+')) + "$");
                      if (regexp.test(type)) {
                        binder = value;
                      }
                    }
                  }
                }
                binder || (binder = _this.binders['*']);
                if (binder.block) {
                  _ref3 = node.childNodes;
                  for (_k = 0, _len2 = _ref3.length; _k < _len2; _k++) {
                    n = _ref3[_k];
                    skipNodes.push(n);
                  }
                  attributes = [attribute];
                }
              }
            }
            _ref4 = attributes || node.attributes;
            for (_l = 0, _len3 = _ref4.length; _l < _len3; _l++) {
              attribute = _ref4[_l];
              if (bindingRegExp.test(attribute.name)) {
                type = attribute.name.replace(bindingRegExp, '');
                buildBinding('Binding', node, type, attribute.value);
              }
            }
          }
          _ref5 = (function() {
            var _len4, _n, _ref5, _results1;
            _ref5 = node.childNodes;
            _results1 = [];
            for (_n = 0, _len4 = _ref5.length; _n < _len4; _n++) {
              n = _ref5[_n];
              _results1.push(n);
            }
            return _results1;
          })();
          _results = [];
          for (_m = 0, _len4 = _ref5.length; _m < _len4; _m++) {
            childNode = _ref5[_m];
            _results.push(parse(childNode));
          }
          return _results;
        }
      };
      _ref1 = this.els;
      for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
        el = _ref1[_i];
        parse(el);
      }
    };

    View.prototype.select = function(fn) {
      var binding, _i, _len, _ref1, _results;
      _ref1 = this.bindings;
      _results = [];
      for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
        binding = _ref1[_i];
        if (fn(binding)) {
          _results.push(binding);
        }
      }
      return _results;
    };

    View.prototype.bind = function() {
      var binding, _i, _len, _ref1, _results;
      _ref1 = this.bindings;
      _results = [];
      for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
        binding = _ref1[_i];
        _results.push(binding.bind());
      }
      return _results;
    };

    View.prototype.unbind = function() {
      var binding, _i, _len, _ref1, _results;
      _ref1 = this.bindings;
      _results = [];
      for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
        binding = _ref1[_i];
        _results.push(binding.unbind());
      }
      return _results;
    };

    View.prototype.sync = function() {
      var binding, _i, _len, _ref1, _results;
      _ref1 = this.bindings;
      _results = [];
      for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
        binding = _ref1[_i];
        _results.push(binding.sync());
      }
      return _results;
    };

    View.prototype.publish = function() {
      var binding, _i, _len, _ref1, _results;
      _ref1 = this.select(function(b) {
        return b.binder.publishes;
      });
      _results = [];
      for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
        binding = _ref1[_i];
        _results.push(binding.publish());
      }
      return _results;
    };

    View.prototype.update = function(models) {
      var binding, key, model, _i, _len, _ref1, _results;
      if (models == null) {
        models = {};
      }
      for (key in models) {
        model = models[key];
        this.models[key] = model;
      }
      _ref1 = this.bindings;
      _results = [];
      for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
        binding = _ref1[_i];
        _results.push(binding.update(models));
      }
      return _results;
    };

    return View;

  })();

  Rivets.Binding = (function() {
    function Binding(view, el, type, keypath, options) {
      this.view = view;
      this.el = el;
      this.type = type;
      this.keypath = keypath;
      this.options = options != null ? options : {};
      this.update = __bind(this.update, this);
      this.unbind = __bind(this.unbind, this);
      this.bind = __bind(this.bind, this);
      this.publish = __bind(this.publish, this);
      this.sync = __bind(this.sync, this);
      this.set = __bind(this.set, this);
      this.eventHandler = __bind(this.eventHandler, this);
      this.formattedValue = __bind(this.formattedValue, this);
      this.setBinder = __bind(this.setBinder, this);
      this.formatters = this.options.formatters || [];
      this.dependencies = [];
      this.model = void 0;
      this.setBinder();
    }

    Binding.prototype.setBinder = function() {
      var identifier, regexp, value, _ref1;
      if (!(this.binder = this.view.binders[this.type])) {
        _ref1 = this.view.binders;
        for (identifier in _ref1) {
          value = _ref1[identifier];
          if (identifier !== '*' && identifier.indexOf('*') !== -1) {
            regexp = new RegExp("^" + (identifier.replace('*', '.+')) + "$");
            if (regexp.test(this.type)) {
              this.binder = value;
              this.args = new RegExp("^" + (identifier.replace('*', '(.+)')) + "$").exec(this.type);
              this.args.shift();
            }
          }
        }
      }
      this.binder || (this.binder = this.view.binders['*']);
      if (this.binder instanceof Function) {
        return this.binder = {
          routine: this.binder
        };
      }
    };

    Binding.prototype.formattedValue = function(value) {
      var args, formatter, id, _i, _len, _ref1;
      _ref1 = this.formatters;
      for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
        formatter = _ref1[_i];
        args = formatter.split(/\s+/);
        id = args.shift();
        formatter = this.view.formatters[id];
        if ((formatter != null ? formatter.read : void 0) instanceof Function) {
          value = formatter.read.apply(formatter, [value].concat(__slice.call(args)));
        } else if (formatter instanceof Function) {
          value = formatter.apply(null, [value].concat(__slice.call(args)));
        }
      }
      return value;
    };

    Binding.prototype.eventHandler = function(fn) {
      var binding, handler;
      handler = (binding = this).view.config.handler;
      return function(ev) {
        return handler.call(fn, this, ev, binding);
      };
    };

    Binding.prototype.set = function(value) {
      var _ref1;
      value = value instanceof Function && !this.binder["function"] ? this.formattedValue(value.call(this.model)) : this.formattedValue(value);
      return (_ref1 = this.binder.routine) != null ? _ref1.call(this, this.el, value) : void 0;
    };

    Binding.prototype.sync = function() {
      var dependency, observer, _i, _j, _len, _len1, _ref1, _ref2, _ref3;
      if (this.model !== this.observer.target) {
        _ref1 = this.dependencies;
        for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
          observer = _ref1[_i];
          observer.unobserve();
        }
        this.dependencies = [];
        if (((this.model = this.observer.target) != null) && ((_ref2 = this.options.dependencies) != null ? _ref2.length : void 0)) {
          _ref3 = this.options.dependencies;
          for (_j = 0, _len1 = _ref3.length; _j < _len1; _j++) {
            dependency = _ref3[_j];
            observer = new Rivets.Observer(this.view, this.model, dependency, this.sync);
            this.dependencies.push(observer);
          }
        }
      }
      return this.set(this.observer.value());
    };

    Binding.prototype.publish = function() {
      var args, formatter, id, value, _i, _len, _ref1, _ref2, _ref3;
      value = Rivets.Util.getInputValue(this.el);
      _ref1 = this.formatters.slice(0).reverse();
      for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
        formatter = _ref1[_i];
        args = formatter.split(/\s+/);
        id = args.shift();
        if ((_ref2 = this.view.formatters[id]) != null ? _ref2.publish : void 0) {
          value = (_ref3 = this.view.formatters[id]).publish.apply(_ref3, [value].concat(__slice.call(args)));
        }
      }
      return this.observer.publish(value);
    };

    Binding.prototype.bind = function() {
      var dependency, observer, _i, _len, _ref1, _ref2, _ref3;
      if ((_ref1 = this.binder.bind) != null) {
        _ref1.call(this, this.el);
      }
      this.observer = new Rivets.Observer(this.view, this.view.models, this.keypath, this.sync);
      this.model = this.observer.target;
      if ((this.model != null) && ((_ref2 = this.options.dependencies) != null ? _ref2.length : void 0)) {
        _ref3 = this.options.dependencies;
        for (_i = 0, _len = _ref3.length; _i < _len; _i++) {
          dependency = _ref3[_i];
          observer = new Rivets.Observer(this.view, this.model, dependency, this.sync);
          this.dependencies.push(observer);
        }
      }
      if (this.view.config.preloadData) {
        return this.sync();
      }
    };

    Binding.prototype.unbind = function() {
      var observer, _i, _len, _ref1, _ref2;
      if ((_ref1 = this.binder.unbind) != null) {
        _ref1.call(this, this.el);
      }
      this.observer.unobserve();
      _ref2 = this.dependencies;
      for (_i = 0, _len = _ref2.length; _i < _len; _i++) {
        observer = _ref2[_i];
        observer.unobserve();
      }
      return this.dependencies = [];
    };

    Binding.prototype.update = function(models) {
      var _ref1;
      if (models == null) {
        models = {};
      }
      this.model = this.observer.target;
      return (_ref1 = this.binder.update) != null ? _ref1.call(this, models) : void 0;
    };

    return Binding;

  })();

  Rivets.ComponentBinding = (function(_super) {
    __extends(ComponentBinding, _super);

    function ComponentBinding(view, el, type) {
      var attribute, _i, _len, _ref1, _ref2;
      this.view = view;
      this.el = el;
      this.type = type;
      this.unbind = __bind(this.unbind, this);
      this.bind = __bind(this.bind, this);
      this.update = __bind(this.update, this);
      this.locals = __bind(this.locals, this);
      this.component = Rivets.components[this.type];
      this.attributes = {};
      this.inflections = {};
      _ref1 = this.el.attributes || [];
      for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
        attribute = _ref1[_i];
        if (_ref2 = attribute.name, __indexOf.call(this.component.attributes, _ref2) >= 0) {
          this.attributes[attribute.name] = attribute.value;
        } else {
          this.inflections[attribute.name] = attribute.value;
        }
      }
    }

    ComponentBinding.prototype.sync = function() {};

    ComponentBinding.prototype.locals = function(models) {
      var inverse, key, model, path, result, _i, _len, _ref1, _ref2;
      if (models == null) {
        models = this.view.models;
      }
      result = {};
      _ref1 = this.inflections;
      for (key in _ref1) {
        inverse = _ref1[key];
        _ref2 = inverse.split('.');
        for (_i = 0, _len = _ref2.length; _i < _len; _i++) {
          path = _ref2[_i];
          result[key] = (result[key] || models)[path];
        }
      }
      for (key in models) {
        model = models[key];
        if (result[key] == null) {
          result[key] = model;
        }
      }
      return result;
    };

    ComponentBinding.prototype.update = function(models) {
      var _ref1;
      return (_ref1 = this.componentView) != null ? _ref1.update(this.locals(models)) : void 0;
    };

    ComponentBinding.prototype.bind = function() {
      var el, _ref1;
      if (this.componentView != null) {
        return (_ref1 = this.componentView) != null ? _ref1.bind() : void 0;
      } else {
        el = this.component.build.call(this.attributes);
        (this.componentView = new Rivets.View(el, this.locals(), this.view.options)).bind();
        return this.el.parentNode.replaceChild(el, this.el);
      }
    };

    ComponentBinding.prototype.unbind = function() {
      var _ref1;
      return (_ref1 = this.componentView) != null ? _ref1.unbind() : void 0;
    };

    return ComponentBinding;

  })(Rivets.Binding);

  Rivets.TextBinding = (function(_super) {
    __extends(TextBinding, _super);

    function TextBinding(view, el, type, keypath, options) {
      this.view = view;
      this.el = el;
      this.type = type;
      this.keypath = keypath;
      this.options = options != null ? options : {};
      this.sync = __bind(this.sync, this);
      this.formatters = this.options.formatters || [];
      this.dependencies = [];
    }

    TextBinding.prototype.binder = {
      routine: function(node, value) {
        return node.data = value != null ? value : '';
      }
    };

    TextBinding.prototype.sync = function() {
      return TextBinding.__super__.sync.apply(this, arguments);
    };

    return TextBinding;

  })(Rivets.Binding);

  Rivets.KeypathParser = (function() {
    function KeypathParser() {}

    KeypathParser.parse = function(keypath, interfaces, root) {
      var char, current, index, tokens, _i, _ref1;
      tokens = [];
      current = {
        "interface": root,
        path: ''
      };
      for (index = _i = 0, _ref1 = keypath.length; _i < _ref1; index = _i += 1) {
        char = keypath.charAt(index);
        if (__indexOf.call(interfaces, char) >= 0) {
          tokens.push(current);
          current = {
            "interface": char,
            path: ''
          };
        } else {
          current.path += char;
        }
      }
      tokens.push(current);
      return tokens;
    };

    return KeypathParser;

  })();

  Rivets.TextTemplateParser = (function() {
    function TextTemplateParser() {}

    TextTemplateParser.types = {
      text: 0,
      binding: 1
    };

    TextTemplateParser.parse = function(template, delimiters) {
      var index, lastIndex, lastToken, length, substring, tokens, value;
      tokens = [];
      length = template.length;
      index = 0;
      lastIndex = 0;
      while (lastIndex < length) {
        index = template.indexOf(delimiters[0], lastIndex);
        if (index < 0) {
          tokens.push({
            type: this.types.text,
            value: template.slice(lastIndex)
          });
          break;
        } else {
          if (index > 0 && lastIndex < index) {
            tokens.push({
              type: this.types.text,
              value: template.slice(lastIndex, index)
            });
          }
          lastIndex = index + delimiters[0].length;
          index = template.indexOf(delimiters[1], lastIndex);
          if (index < 0) {
            substring = template.slice(lastIndex - delimiters[1].length);
            lastToken = tokens[tokens.length - 1];
            if ((lastToken != null ? lastToken.type : void 0) === this.types.text) {
              lastToken.value += substring;
            } else {
              tokens.push({
                type: this.types.text,
                value: substring
              });
            }
            break;
          }
          value = template.slice(lastIndex, index).trim();
          tokens.push({
            type: this.types.binding,
            value: value
          });
          lastIndex = index + delimiters[1].length;
        }
      }
      return tokens;
    };

    return TextTemplateParser;

  })();

  Rivets.Observer = (function() {
    function Observer(view, model, keypath, callback) {
      this.view = view;
      this.model = model;
      this.keypath = keypath;
      this.callback = callback;
      this.unobserve = __bind(this.unobserve, this);
      this.realize = __bind(this.realize, this);
      this.value = __bind(this.value, this);
      this.publish = __bind(this.publish, this);
      this.read = __bind(this.read, this);
      this.set = __bind(this.set, this);
      this.adapter = __bind(this.adapter, this);
      this.update = __bind(this.update, this);
      this.initialize = __bind(this.initialize, this);
      this.parse = __bind(this.parse, this);
      this.parse();
      this.initialize();
    }

    Observer.prototype.parse = function() {
      var interfaces, k, path, root, v, _ref1;
      interfaces = (function() {
        var _ref1, _results;
        _ref1 = this.view.adapters;
        _results = [];
        for (k in _ref1) {
          v = _ref1[k];
          _results.push(k);
        }
        return _results;
      }).call(this);
      if (_ref1 = this.keypath[0], __indexOf.call(interfaces, _ref1) >= 0) {
        root = this.keypath[0];
        path = this.keypath.substr(1);
      } else {
        root = this.view.config.rootInterface;
        path = this.keypath;
      }
      this.tokens = Rivets.KeypathParser.parse(path, interfaces, root);
      return this.key = this.tokens.pop();
    };

    Observer.prototype.initialize = function() {
      this.objectPath = [];
      this.target = this.realize();
      if (this.target != null) {
        return this.set(true, this.key, this.target, this.callback);
      }
    };

    Observer.prototype.update = function() {
      var next, oldValue;
      if ((next = this.realize()) !== this.target) {
        if (this.target != null) {
          this.set(false, this.key, this.target, this.callback);
        }
        if (next != null) {
          this.set(true, this.key, next, this.callback);
        }
        oldValue = this.value();
        this.target = next;
        if (this.value() !== oldValue) {
          return this.callback();
        }
      }
    };

    Observer.prototype.adapter = function(key) {
      return this.view.adapters[key["interface"]];
    };

    Observer.prototype.set = function(active, key, obj, callback) {
      var action;
      action = active ? 'subscribe' : 'unsubscribe';
      return this.adapter(key)[action](obj, key.path, callback);
    };

    Observer.prototype.read = function(key, obj) {
      return this.adapter(key).read(obj, key.path);
    };

    Observer.prototype.publish = function(value) {
      if (this.target != null) {
        return this.adapter(this.key).publish(this.target, this.key.path, value);
      }
    };

    Observer.prototype.value = function() {
      if (this.target != null) {
        return this.read(this.key, this.target);
      }
    };

    Observer.prototype.realize = function() {
      var current, index, prev, token, unreached, _i, _len, _ref1;
      current = this.model;
      unreached = null;
      _ref1 = this.tokens;
      for (index = _i = 0, _len = _ref1.length; _i < _len; index = ++_i) {
        token = _ref1[index];
        if (current != null) {
          if (this.objectPath[index] != null) {
            if (current !== (prev = this.objectPath[index])) {
              this.set(false, token, prev, this.update);
              this.set(true, token, current, this.update);
              this.objectPath[index] = current;
            }
          } else {
            this.set(true, token, current, this.update);
            this.objectPath[index] = current;
          }
          current = this.read(token, current);
        } else {
          if (unreached == null) {
            unreached = index;
          }
          if (prev = this.objectPath[index]) {
            this.set(false, token, prev, this.update);
          }
        }
      }
      if (unreached != null) {
        this.objectPath.splice(unreached);
      }
      return current;
    };

    Observer.prototype.unobserve = function() {
      var index, obj, token, _i, _len, _ref1;
      _ref1 = this.tokens;
      for (index = _i = 0, _len = _ref1.length; _i < _len; index = ++_i) {
        token = _ref1[index];
        if (obj = this.objectPath[index]) {
          this.set(false, token, obj, this.update);
        }
      }
      if (this.target != null) {
        return this.set(false, this.key, this.target, this.callback);
      }
    };

    return Observer;

  })();

  Rivets.binders.text = function(el, value) {
    if (el.textContent != null) {
      return el.textContent = value != null ? value : '';
    } else {
      return el.innerText = value != null ? value : '';
    }
  };

  Rivets.binders.html = function(el, value) {
    return el.innerHTML = value != null ? value : '';
  };

  Rivets.binders.show = function(el, value) {
    return el.style.display = value ? '' : 'none';
  };

  Rivets.binders.hide = function(el, value) {
    return el.style.display = value ? 'none' : '';
  };

  Rivets.binders.enabled = function(el, value) {
    return el.disabled = !value;
  };

  Rivets.binders.disabled = function(el, value) {
    return el.disabled = !!value;
  };

  Rivets.binders.checked = {
    publishes: true,
    bind: function(el) {
      return Rivets.Util.bindEvent(el, 'change', this.publish);
    },
    unbind: function(el) {
      return Rivets.Util.unbindEvent(el, 'change', this.publish);
    },
    routine: function(el, value) {
      var _ref1;
      if (el.type === 'radio') {
        return el.checked = ((_ref1 = el.value) != null ? _ref1.toString() : void 0) === (value != null ? value.toString() : void 0);
      } else {
        return el.checked = !!value;
      }
    }
  };

  Rivets.binders.unchecked = {
    publishes: true,
    bind: function(el) {
      return Rivets.Util.bindEvent(el, 'change', this.publish);
    },
    unbind: function(el) {
      return Rivets.Util.unbindEvent(el, 'change', this.publish);
    },
    routine: function(el, value) {
      var _ref1;
      if (el.type === 'radio') {
        return el.checked = ((_ref1 = el.value) != null ? _ref1.toString() : void 0) !== (value != null ? value.toString() : void 0);
      } else {
        return el.checked = !value;
      }
    }
  };

  Rivets.binders.value = {
    publishes: true,
    bind: function(el) {
      return Rivets.Util.bindEvent(el, 'change', this.publish);
    },
    unbind: function(el) {
      return Rivets.Util.unbindEvent(el, 'change', this.publish);
    },
    routine: function(el, value) {
      var o, _i, _len, _ref1, _ref2, _ref3, _results;
      if (window.jQuery != null) {
        el = jQuery(el);
        if ((value != null ? value.toString() : void 0) !== ((_ref1 = el.val()) != null ? _ref1.toString() : void 0)) {
          return el.val(value != null ? value : '');
        }
      } else {
        if (el.type === 'select-multiple') {
          if (value != null) {
            _results = [];
            for (_i = 0, _len = el.length; _i < _len; _i++) {
              o = el[_i];
              _results.push(o.selected = (_ref2 = o.value, __indexOf.call(value, _ref2) >= 0));
            }
            return _results;
          }
        } else if ((value != null ? value.toString() : void 0) !== ((_ref3 = el.value) != null ? _ref3.toString() : void 0)) {
          return el.value = value != null ? value : '';
        }
      }
    }
  };

  Rivets.binders["if"] = {
    block: true,
    bind: function(el) {
      var attr, declaration;
      if (this.marker == null) {
        attr = [this.view.config.prefix, this.type].join('-').replace('--', '-');
        declaration = el.getAttribute(attr);
        this.marker = document.createComment(" rivets: " + this.type + " " + declaration + " ");
        el.removeAttribute(attr);
        el.parentNode.insertBefore(this.marker, el);
        return el.parentNode.removeChild(el);
      }
    },
    unbind: function() {
      var _ref1;
      return (_ref1 = this.nested) != null ? _ref1.unbind() : void 0;
    },
    routine: function(el, value) {
      var key, model, models, options, _ref1;
      if (!!value === (this.nested == null)) {
        if (value) {
          models = {};
          _ref1 = this.view.models;
          for (key in _ref1) {
            model = _ref1[key];
            models[key] = model;
          }
          options = {
            binders: this.view.options.binders,
            formatters: this.view.options.formatters,
            adapters: this.view.options.adapters,
            config: this.view.options.config
          };
          (this.nested = new Rivets.View(el, models, options)).bind();
          return this.marker.parentNode.insertBefore(el, this.marker.nextSibling);
        } else {
          el.parentNode.removeChild(el);
          this.nested.unbind();
          return delete this.nested;
        }
      }
    },
    update: function(models) {
      var _ref1;
      return (_ref1 = this.nested) != null ? _ref1.update(models) : void 0;
    }
  };

  Rivets.binders.unless = {
    block: true,
    bind: function(el) {
      return Rivets.binders["if"].bind.call(this, el);
    },
    unbind: function() {
      return Rivets.binders["if"].unbind.call(this);
    },
    routine: function(el, value) {
      return Rivets.binders["if"].routine.call(this, el, !value);
    },
    update: function(models) {
      return Rivets.binders["if"].update.call(this, models);
    }
  };

  Rivets.binders['on-*'] = {
    "function": true,
    unbind: function(el) {
      if (this.handler) {
        return Rivets.Util.unbindEvent(el, this.args[0], this.handler);
      }
    },
    routine: function(el, value) {
      if (this.handler) {
        Rivets.Util.unbindEvent(el, this.args[0], this.handler);
      }
      return Rivets.Util.bindEvent(el, this.args[0], this.handler = this.eventHandler(value));
    }
  };

  Rivets.binders['each-*'] = {
    block: true,
    bind: function(el) {
      var attr;
      if (this.marker == null) {
        attr = [this.view.config.prefix, this.type].join('-').replace('--', '-');
        this.marker = document.createComment(" rivets: " + this.type + " ");
        this.iterated = [];
        el.removeAttribute(attr);
        el.parentNode.insertBefore(this.marker, el);
        return el.parentNode.removeChild(el);
      }
    },
    unbind: function(el) {
      var view, _i, _len, _ref1, _results;
      if (this.iterated != null) {
        _ref1 = this.iterated;
        _results = [];
        for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
          view = _ref1[_i];
          _results.push(view.unbind());
        }
        return _results;
      }
    },
    routine: function(el, collection) {
      var binding, data, i, index, k, key, model, modelName, options, previous, template, v, view, _i, _j, _k, _len, _len1, _len2, _ref1, _ref2, _ref3, _ref4, _results;
      modelName = this.args[0];
      collection = collection || [];
      if (this.iterated.length > collection.length) {
        _ref1 = Array(this.iterated.length - collection.length);
        for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
          i = _ref1[_i];
          view = this.iterated.pop();
          view.unbind();
          this.marker.parentNode.removeChild(view.els[0]);
        }
      }
      for (index = _j = 0, _len1 = collection.length; _j < _len1; index = ++_j) {
        model = collection[index];
        data = {
          index: index
        };
        data[modelName] = model;
        if (this.iterated[index] == null) {
          _ref2 = this.view.models;
          for (key in _ref2) {
            model = _ref2[key];
            if (data[key] == null) {
              data[key] = model;
            }
          }
          previous = this.iterated.length ? this.iterated[this.iterated.length - 1].els[0] : this.marker;
          options = {
            binders: this.view.options.binders,
            formatters: this.view.options.formatters,
            adapters: this.view.options.adapters,
            config: {}
          };
          _ref3 = this.view.options.config;
          for (k in _ref3) {
            v = _ref3[k];
            options.config[k] = v;
          }
          options.config.preloadData = true;
          template = el.cloneNode(true);
          view = new Rivets.View(template, data, options);
          view.bind();
          this.iterated.push(view);
          this.marker.parentNode.insertBefore(template, previous.nextSibling);
        } else if (this.iterated[index].models[modelName] !== model) {
          this.iterated[index].update(data);
        }
      }
      if (el.nodeName === 'OPTION') {
        _ref4 = this.view.bindings;
        _results = [];
        for (_k = 0, _len2 = _ref4.length; _k < _len2; _k++) {
          binding = _ref4[_k];
          if (binding.el === this.marker.parentNode && binding.type === 'value') {
            _results.push(binding.sync());
          } else {
            _results.push(void 0);
          }
        }
        return _results;
      }
    },
    update: function(models) {
      var data, key, model, view, _i, _len, _ref1, _results;
      data = {};
      for (key in models) {
        model = models[key];
        if (key !== this.args[0]) {
          data[key] = model;
        }
      }
      _ref1 = this.iterated;
      _results = [];
      for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
        view = _ref1[_i];
        _results.push(view.update(data));
      }
      return _results;
    }
  };

  Rivets.binders['class-*'] = function(el, value) {
    var elClass;
    elClass = " " + el.className + " ";
    if (!value === (elClass.indexOf(" " + this.args[0] + " ") !== -1)) {
      return el.className = value ? "" + el.className + " " + this.args[0] : elClass.replace(" " + this.args[0] + " ", ' ').trim();
    }
  };

  Rivets.binders['*'] = function(el, value) {
    if (value != null) {
      return el.setAttribute(this.type, value);
    } else {
      return el.removeAttribute(this.type);
    }
  };

  Rivets.adapters['.'] = {
    id: '_rv',
    counter: 0,
    weakmap: {},
    weakReference: function(obj) {
      var id;
      if (obj[this.id] == null) {
        id = this.counter++;
        this.weakmap[id] = {
          callbacks: {}
        };
        Object.defineProperty(obj, this.id, {
          value: id
        });
      }
      return this.weakmap[obj[this.id]];
    },
    stubFunction: function(obj, fn) {
      var map, original, weakmap;
      original = obj[fn];
      map = this.weakReference(obj);
      weakmap = this.weakmap;
      return obj[fn] = function() {
        var callback, k, r, response, _i, _len, _ref1, _ref2, _ref3, _ref4;
        response = original.apply(obj, arguments);
        _ref1 = map.pointers;
        for (r in _ref1) {
          k = _ref1[r];
          _ref4 = (_ref2 = (_ref3 = weakmap[r]) != null ? _ref3.callbacks[k] : void 0) != null ? _ref2 : [];
          for (_i = 0, _len = _ref4.length; _i < _len; _i++) {
            callback = _ref4[_i];
            callback();
          }
        }
        return response;
      };
    },
    observeMutations: function(obj, ref, keypath) {
      var fn, functions, map, _base, _i, _len;
      if (Array.isArray(obj)) {
        map = this.weakReference(obj);
        if (map.pointers == null) {
          map.pointers = {};
          functions = ['push', 'pop', 'shift', 'unshift', 'sort', 'reverse', 'splice'];
          for (_i = 0, _len = functions.length; _i < _len; _i++) {
            fn = functions[_i];
            this.stubFunction(obj, fn);
          }
        }
        if ((_base = map.pointers)[ref] == null) {
          _base[ref] = [];
        }
        if (__indexOf.call(map.pointers[ref], keypath) < 0) {
          return map.pointers[ref].push(keypath);
        }
      }
    },
    unobserveMutations: function(obj, ref, keypath) {
      var keypaths, _ref1;
      if (Array.isArray(obj && (obj[this.id] != null))) {
        if (keypaths = (_ref1 = this.weakReference(obj).pointers) != null ? _ref1[ref] : void 0) {
          return keypaths.splice(keypaths.indexOf(keypath), 1);
        }
      }
    },
    subscribe: function(obj, keypath, callback) {
      var callbacks, value,
        _this = this;
      callbacks = this.weakReference(obj).callbacks;
      if (callbacks[keypath] == null) {
        callbacks[keypath] = [];
        value = obj[keypath];
        Object.defineProperty(obj, keypath, {
          enumerable: true,
          get: function() {
            return value;
          },
          set: function(newValue) {
            var _i, _len, _ref1;
            if (newValue !== value) {
              value = newValue;
              _ref1 = callbacks[keypath];
              for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
                callback = _ref1[_i];
                callback();
              }
              return _this.observeMutations(newValue, obj[_this.id], keypath);
            }
          }
        });
      }
      if (__indexOf.call(callbacks[keypath], callback) < 0) {
        callbacks[keypath].push(callback);
      }
      return this.observeMutations(obj[keypath], obj[this.id], keypath);
    },
    unsubscribe: function(obj, keypath, callback) {
      var callbacks;
      callbacks = this.weakmap[obj[this.id]].callbacks[keypath];
      callbacks.splice(callbacks.indexOf(callback), 1);
      return this.unobserveMutations(obj[keypath], obj[this.id], keypath);
    },
    read: function(obj, keypath) {
      return obj[keypath];
    },
    publish: function(obj, keypath, value) {
      return obj[keypath] = value;
    }
  };

  Rivets.factory = function(exports) {
    exports._ = Rivets;
    exports.binders = Rivets.binders;
    exports.components = Rivets.components;
    exports.formatters = Rivets.formatters;
    exports.adapters = Rivets.adapters;
    exports.config = Rivets.config;
    exports.configure = function(options) {
      var property, value;
      if (options == null) {
        options = {};
      }
      for (property in options) {
        value = options[property];
        Rivets.config[property] = value;
      }
    };
    return exports.bind = function(el, models, options) {
      var view;
      if (models == null) {
        models = {};
      }
      if (options == null) {
        options = {};
      }
      view = new Rivets.View(el, models, options);
      view.bind();
      return view;
    };
  };

  if (typeof exports === 'object') {
    Rivets.factory(exports);
  } else if (typeof define === 'function' && define.amd) {
    define('rivets',['exports'], function(exports) {
      Rivets.factory(this.rivets = exports);
      return exports;
    });
  } else {
    Rivets.factory(this.rivets = {});
  }

}).call(this);

/*jslint indent:2, node:true*/
/*global define, require*/ // Require.JS

// if the module has no dependencies, the above pattern can be simplified to
(function (root, factory) {
  
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.
    define('bicyclepump',[], factory);
  } else if (typeof exports === 'object') {
    // Node. Does not work with strict CommonJS, but
    // only CommonJS-like environments that support module.exports,
    // like Node.
    module.exports = factory();
  } else {
    // Browser globals (root is window)
    root.BicyclePump = factory();
  }
}(this, function () {
  

  /**
   * @module bicyclepump
   */

  var BicyclePump, asyncExec, asyncForEach;

  // https://github.com/caolan/async/blob/master/lib/async.js#L75
  // asynchronous execution with browser-compatible fallback
  if (typeof setImmediate === 'function') {
    asyncExec = function (fn) {
      // not a direct alias for IE10 compatibility
      setImmediate(fn);
    };
  } else if (typeof process === 'object' && process && process.nextTick) {
    asyncExec = process.nextTick;
  } else {
    asyncExec = function (fn) {
      setTimeout(fn, 0);
    };
  }

  // https://github.com/caolan/async/blob/master/lib/async.js#L127
  // inspired by async.eachSeries, but tailored for BicyclePump
  asyncForEach = function (arr, obj, callback) {
    var index, inflator, iterate, noop, done, next;
    index = arr.length;
    noop = function () { return true; };
    callback = callback || noop;
    done = function (result) {
      result = result || new Error('inflation returned no result');
      if (result instanceof Error) {
        callback(result);
        callback = noop;
      } else {
        asyncExec(function () {
          callback(null, result);
        });
      }
    };
    next = function () {
      asyncExec(iterate);
    };
    iterate = function () {
      index -= 1;
      inflator = arr[index];
      inflator(obj, done, next);
    };
    iterate();
  };

  /**
   * @public
   * @constructor BicyclePump
   * @alias module:bicyclepump
   */
  BicyclePump = function () {
    /**
     * @property {inflator[]} inflators
     */
    var inflators;

    inflators = [];

    /**
     * @public
     * @memberof BicyclePump#
     * @param {inflator} fn
     */
    this.addInflator = function (fn) {
      if (typeof fn === 'function') {
        inflators.push(fn);
      }
    };

    /**
     * @public
     * @memberof BicyclePump#
     * @param {inflator} fn
     */
    this.removeInflator = function (fn) {
      var index;
      index = inflators.indexOf(fn);
      inflators.splice(index, 1);
    };

    /**
     * @public
     * @memberof BicyclePump#
     * @return {inflator[]}
     */
    this.getInflators = function () {
      var copy;
      copy = [];
      copy.push.apply(copy, inflators);
      return copy;
    };

    /**
     * @public
     * @memberof BicyclePump#
     * @param {Object} obj
     * @param {Function} [callback]
     * @return {Promise} but only if ES6 Promises are available
     */
    this.inflate = function (obj, callback) {
      var done;
      if (!obj) {
        throw new Error('need something to inflate');
      }
      if (!inflators.length) {
        throw new Error('need to register an Inflator first');
      }
      done = function (err, result) {
        if (typeof callback === 'function') {
          callback(err, result);
        }
      };
      if (typeof Promise === 'function') {
        return new Promise(function (resolve, reject) {
          asyncForEach(inflators, obj, function (err, result) {
            done(err, result);
            if (err) {
              reject(err);
            } else {
              resolve(result);
            }
          });
        });
      }
      asyncForEach(inflators, obj, done);
    };

    return this;
  };

  return BicyclePump;
}));

define('models/element',[],function () {
  var Element;

  Element = Backbone.Model.extend({
    defaults: {
      page: 0,
      defaultValue: '',
      value: '',
      pattern: '',
      persist: true
    },
    idAttribute: 'name',
    initialize: function () {
      var attrs = this.attributes,
        form = attrs.form,
        page = attrs.page,
        section = $.trim(attrs.section || '');

      this.initializeView();

      if (form) {
        page = attrs.page = form.getPage(attrs.page);
        if (page && section) {
          section = attrs.section = page.getSection(section);
          section.add(this);
        } else {
          page.add(this);
          delete attrs.section;
        }
      }

      this.set('value', attrs.defaultValue);
      if (!attrs.label && attrs.type !== 'message') {
        if (attrs.prefix) {
          this.set('label', attrs.name + ' ' + attrs.prefix);
        } else {
          this.set('label', attrs.name);
        }
      }
      this.on('change', this.updateErrors, this);
    },
    validate: function (attrs) {
      var errors = {};
      if (attrs === undefined) {
        attrs = this.attributes;
      }
      if (attrs.required && !attrs.value) {
        errors.value = errors.value || [];
        errors.value.push({code: 'REQUIRED'});
      }
      if (attrs.pattern && attrs.value &&
          !(new RegExp(attrs.pattern).test(attrs.value))) {
        errors.value = errors.value || [];
        errors.value.push({code: 'PATTERN', PATTERN: attrs.pattern});
      }
      return _.isEmpty(errors) ? undefined : errors;
    },
    updateErrors: function () {
      this.set('errors', this.validate());
    },
    removeView: function () {
      var attrs = this.attributes;
      if (attrs._view) {
        attrs._view.remove();
        delete attrs._view;
      }
    },
    destroy: function (options) {
      var attrs = this.attributes;
      delete attrs.form;
      delete attrs.page;
      delete attrs.section;
      this.id = null; // to prevent "sync"
      this.off(null, null, this);
      return Backbone.Model.prototype.destroy.call(this, options);
    },
    /**
     * this will close any existing view first, then establish a new view
     */
    initializeView: function () {
      var Forms = BMP.Forms,
        attrs = this.attributes,
        View,
        view,
        mode;

      this.removeView();

      switch (attrs.type) {
      case 'subForm':
        View = Forms._views.SubFormElement;
        break;
      case 'heading':
        View = Forms._views.HeadingElement;
        break;
      case 'message':
        View = Forms._views.MessageElement;
        break;
      case 'boolean':
        View = Forms._views.BooleanElement;
        break;
      case 'select':
        mode = attrs.mode || 'collapsed';
        mode = mode[0].toUpperCase() + mode.substring(1);
        View = Forms._views['Choice' + mode + 'Element'];
        break;
      case 'multi':
        mode = attrs.mode || 'collapsed';
        mode = mode[0].toUpperCase() + mode.substring(1);
        View = Forms._views['Choice' + mode + 'Element'];
        break;
      case 'hidden':
        View = Forms._views.HiddenElement;
        break;
      case 'number':
        View = Forms._views.NumberElement;
        break;
      case 'telephone':
        View = Forms._views.TelephoneElement;
        break;
      case 'password':
        View = Forms._views.PasswordElement;
        break;
      case 'email':
        View = Forms._views.EmailElement;
        break;
      case 'url':
        View = Forms._views.URLElement;
        break;
      case 'text':
        View = Forms._views.TextElement;
        break;
      case 'textarea':
        View = Forms._views.TextAreaElement;
        break;
      default:
        View = Forms._views.Element;
      }
      view = new View({model: this});
      this.set('_view', view);
      return view;
    },
    /**
     * official Blink API
     */
    val: function (value) {
      if (value === undefined) {
        return this.get('value');
      }
      this.set('value', value);
      return value;
    }
  }, {
    // static properties
    /**
     * @param {Object} attrs attributes for this model.
     * @param {Form} form parent to associate with new Element.
     * @return {Element} new Element.
     */
    create: function (attrs, form) {
      var Forms = BMP.Forms,
        dateTypes = ['date', 'time', 'datetime'],
        el,
        TypedElement;

      if (!attrs || !_.isObject(attrs)) {
        return new Element();
      }
      if (form) {
        attrs.form = form;
      }
      // TODO: determine Element type and select sub-Prototype
      switch (attrs.type) {
      case 'draw':
        TypedElement = Forms._models.DrawElement;
        break;
      case 'file':
        TypedElement = Forms._models.FileElement;
        break;
      case 'location':
        TypedElement = Forms._models.LocationElement;
        break;
      case 'subForm':
        TypedElement = Forms._models.SubFormElement;
        break;
      case 'heading':
        TypedElement = Forms._models.HeadingElement;
        break;
      case 'message':
        TypedElement = Forms._models.MessageElement;
        break;
      case 'boolean':
        TypedElement = Forms._models.BooleanElement;
        break;
      case 'select':
        TypedElement = Forms._models.SelectElement;
        break;
      case 'multi':
        TypedElement = Forms._models.MultiElement;
        break;
      case 'hidden':
        TypedElement = Forms._models.HiddenElement;
        break;
      case 'number':
        TypedElement = Forms._models.NumberElement;
        break;
      case 'telephone':
        TypedElement = Forms._models.TelephoneElement;
        break;
      case 'password':
        TypedElement = Forms._models.PasswordElement;
        break;
      case 'email':
        TypedElement = Forms._models.EmailElement;
        break;
      case 'url':
        TypedElement = Forms._models.URLElement;
        break;
      case 'text':
        TypedElement = Forms._models.TextElement;
        break;
      case 'textarea':
        TypedElement = Forms._models.TextAreaElement;
        break;
      default:
        if (_.indexOf(dateTypes, attrs.type) !== -1) {
          TypedElement = Forms._models.DateElement;
        } else {
          TypedElement = Forms._models.Element;
        }
      }
      // TODO: set View = read-only view for m.readOnly
      el = new TypedElement(attrs);
      return el;
    }
  });

  return Element;
});


define('collections/elements',['models/element'], function (Element) {
  return Backbone.Collection.extend({
    model: Element
  });
});



define('models/section',['require','models/element','collections/elements'],function (require) {
  var Element = require('models/element'),
    Section;

  Section = Element.extend({
    initialize: function () {
      var Forms = BMP.Forms,
        Elements = require('collections/elements'),
        attrs = this.attributes;

      attrs.elements = new Elements();
      attrs._view = new Forms._views.Section({model: this});
    },
    destroy: function (options) {
      var attrs = this.attributes;
      if (attrs._view) {
        attrs._view.remove();
        delete attrs._view;
      }
      delete attrs.form;
      attrs.elements.forEach(function (element) {
        element.destroy(options);
      });
      return Backbone.Model.prototype.destroy.call(this, options);
    },
    add: function (element) {
      this.attributes.elements.add(element);
    }
  }, {
    // static properties
    /**
     * @param {Object} attrs attributes for this model.
     * @param {Form} form parent to associate with new Section.
     * @return {Section} new Section.
     */
    create: function (attrs, form) {
      var section;

      if (!attrs || !_.isObject(attrs)) {
        return new Section();
      }
      if (form) {
        attrs.form = form;
      }
      section = new Section(attrs);
      return section;
    }
  });

  return Section;
});


/**
 * Page is a very specific type of Section:
 * - cannot be nested
 * - only used immediately within a form (not deeper in)
 */
define('models/page',['require','collections/elements','models/section'],function (require) {
  var Elements = require('collections/elements'),
    Section = require('models/section'),
    Sections,
    Page;

  Sections = Backbone.Collection.extend({
    model: Section
  });

  Page = Backbone.Model.extend({
    defaults: {
    },
    initialize: function () {
      var Forms = BMP.Forms,
        attrs = this.attributes,
        form = attrs.form,
        sections;

      // TODO: document that this now assumes all Sections are pre-declared

      attrs.elements = new Elements();
      attrs._view = new Forms._views.Page({model: this});

      sections = form.attributes._sections;

      if (sections && _.isArray(sections)) {
        sections = _.map(sections, function (s) {
          return Section.create(s, form);
        });
        sections = new Sections(sections);
      } else {
        sections = new Sections();
      }
      sections.forEach(function (section) {
        var sectionAttrs = section.attributes,
          parent;

        if (sectionAttrs.section) {
          parent = sections.get(sectionAttrs.section);
          if (parent) {
            sectionAttrs.section = parent;
            parent.add(section);
          }
        }
        if (!sectionAttrs.section instanceof Section) {
          delete sectionAttrs.section;
        }
      });
      attrs.sections = sections;
    },
    destroy: function (options) {
      var attrs = this.attributes;
      if (attrs._view) {
        attrs._view.remove();
        delete attrs._view;
      }
      delete attrs.form;
      delete attrs.section;
      attrs.elements.forEach(function (element) {
        element.destroy(options);
      });
      return Backbone.Model.prototype.destroy.call(this, options);
    },
    add: function (element) {
      if (element instanceof Section) {
        this.attributes.sections.add(element);
      }
      if (element.attributes.section) {
        this.add(element.attributes.section);
      } else {
        this.attributes.elements.add(element);
      }
    },
    getSection: function (name) {
      var sections = this.attributes.sections,
        section;

      section = sections.get(name);
      this.add(section);
      return section;
    },
    show: function () {
      var view = this.attributes._view;
      view.show();
    },
    hide: function () {
      var view = this.attributes._view;
      view.hide();
    },
    index: function () {
      var form = this.attributes.form,
        pages = form.attributes.pages;

      return pages.indexOf(this);
    }
  }, {
    // static properties
    /**
     * @param {Object} attrs attributes for this model.
     * @param {Form} form parent to associate with new Page.
     * @return {Page} new Page.
     */
    create: function (attrs, form) {
      var page;

      if (!attrs || !_.isObject(attrs)) {
        return new Page();
      }
      if (form) {
        attrs.form = form;
      }
      page = new Page(attrs);
      return page;
    }

  });

  return Page;
});



define('collections/pages',['models/page'], function (Page) {
  return Backbone.Collection.extend({
    model: Page,
    goto: function (index) {
      var self = this;
      if (!_.isNumber(index)) {
        index = 0;
      }
      self.current = null;
      this.forEach(function (page, number) {
        if (number === index) {
          self.current = page;
          page.show();
        } else {
          page.hide();
        }
      });
    }
  });
});

define('models/form',['require','collections/elements','collections/pages'],function (require) {
  var Elements = require('collections/elements'),
    Pages = require('collections/pages'),
    Form;

  Form = Backbone.Model.extend({
    initialize: function () {
      var Forms = BMP.Forms,
        self = this,
        Page = Forms._models.Page,
        Element = Forms._models.Element,
        Behaviour = Forms._models.Behaviour,
        pages,
        elements,
        behaviours;

      pages = this.attributes._pages;
      delete this.attributes._pages;
      if (pages && _.isArray(pages)) {
        // TODO: allow pages to be redeclared per-action
        pages = new Pages(_.map(pages, function (p) {
          return Page.create(p, self);
        }));
      } else {
        pages = new Pages();
      }
      this.attributes.pages = pages;

      elements = this.attributes._elements;
      delete this.attributes._elements;
      if (elements && _.isArray(elements)) {
        // TODO: allow pages to be redeclared per-action
        elements = _.map(elements, function (e) {
          return Element.create(e, self);
        });
      } else {
        elements = [];
      }
      this.attributes.elements = new Elements(elements);

      behaviours = this.attributes._behaviours;
      delete this.attributes._behaviours;
      if (behaviours && _.isArray(behaviours)) {
        // TODO: allow behaviours to be redeclared per-action
        behaviours = _.map(behaviours, function (b) {
          return Behaviour.create(b, self);
        });
      } else {
        behaviours = [];
      }
      this.attributes.behaviours = behaviours;
    },
    destroy: function (options) {
      var attrs = this.attributes;
      if (attrs._view) {
        attrs._view.remove();
        delete attrs._view;
      }
      delete this.$form;
      attrs.pages.forEach(function (page) {
        page.destroy(options);
      });
      attrs.behaviours.forEach(function (behaviour) {
        behaviour.destroy(options);
      });
      return Backbone.Model.prototype.destroy.call(this, options);
    },
    /**
     * get a Page, creating it if necessary
     * @param {Number} index desired Page index.
     */
    getPage: function (index) {
      var Forms = BMP.Forms,
        Page = Forms._models.Page,
        pages = this.get('pages');

      // assume that by now it's okay to create vanilla Pages
      while (pages.length <= index) {
        pages.push(Page.create({}, this));
      }
      return pages.at(index);
    },
    /**
     * official Blink API
     */
    getElement: function (name) {
      return this.attributes.elements.get(name);
    },
    /**
     * official Blink API
     */
    getRecord: function () {
      var me = this,
        data = {},
        promises = [];

      return new Promise(function (resolve) {
        me.attributes.elements.forEach(function (el) {
          var attrs, type, val, blob;
          attrs = el.attributes;
          type = attrs.type;

          if (!attrs.persist) {
            return;
          }
          if (type === 'subForm') {
            promises.push(new Promise(function (subResolve) {
              el.getRecord().then(function (val) {
                data[el.attributes.name] = val;
                subResolve();
              });
            }));
            return;
          }
          if (type === 'file' || type === 'draw') {
            blob = attrs.blob;
            if (blob && blob.type && (blob.base64 || blob.text)) {
              data[el.attributes.name] = blob.base64 || blob.text;
              data[el.attributes.name + '_mimetype'] = blob.type;
            }
            return;
          }
          if (type === 'location') {
            val = attrs.value;
            if (val) {
              data[el.attributes.name] = JSON.stringify(val);
            }
            return;
          }
          val = el.val();
          if (val || typeof val === 'number') {
            data[el.attributes.name] = val;
          }
        });
        Promise.all(promises).then(function () {
          resolve(data);
        });
      });
    },
    /**
     * official Blink API
     */
    setRecord: function (data) {
      var self = this,
        promises = [];

      return new Promise(function (resolve, reject) {
        if (!_.isObject(data)) {
          reject();
          return;
        }
        _.each(data, function (value, key) {
          var formElement = self.getElement(key);
          if (!formElement) {
            return;
          }
          if (formElement.attributes.type === 'subForm') {
            promises.push(formElement.setRecords(value));
          } else {
            formElement.val(value);
          }
        });
        Promise.all(promises).then(function () {
          resolve(data);
        });
      });
    },
    /**
     * official Blink API
     */
    data: function () {
      if (!arguments.length) {
        return this.getRecord();
      }
    }
  }, {
    // static properties
    /**
     * @param {Object} attrs attributes for this model.
     */
    create: function (attrs) {
      var form;

      if (!attrs || !_.isObject(attrs)) {
        return new Form();
      }

      form = new Form(attrs);

      return form;
    }
  });

  return Form;
});

define('models/elements/subform',['models/form', 'models/element'], function (Form, Element) {
  

  var Forms;

  Forms = Backbone.Collection.extend({
    model: Form
  });

  return Element.extend({
    initialize: function () {
      Element.prototype.initialize.call(this);
      this.attributes.forms = new Forms();
    },
    add: function () {
      // TODO: there is too much DOM stuff here to be in the model
      var attrs = this.attributes,
        name = attrs.subForm,
        forms = attrs.forms,
        $el = attrs._view.$el,
        $button = $el.children('.ui-btn');

      Forms = BMP.Forms;

      return new Promise(function (resolve) {
        Forms.getDefinition(name, 'add').then(function (def) {
          var form,
            view;

          form = Form.create(def);
          forms.add(form);
          view = form.attributes._view = new Forms._views.SubForm({
            model: form
          });
          form.$form = view.$el; // backwards-compatibility, convenience
          view.render();
          $button.before(view.$el);
          view.$el.trigger('create');
          resolve();
        });
      });
    },
    /**
     * @param {Number|Node|jQuery} index or DOM element for the record.
     */
    remove: function (index) {
      var $form;

      Forms = BMP.Forms;

      // TODO: skip placeholder "delete" records when counting
      // TODO: create placeholder records on "edit"
      if (typeof index === 'number') {
        this.attributes.forms.at(index).destroy();
        return;
      }
      $form = index instanceof $ ? index : $(index);
      Forms.getForm($form).destroy();
    },
    size: function () {
      return this.attributes.forms.length;
    },
    getForm: function (index) {
      return this.attributes.forms.at(index);
    },
    getRecord: function () {
      var promises;

      promises = this.attributes.forms.map(function (form) {
        return form.data();
      });

      return new Promise(function (resolve, reject) {
        Promise.all(promises).then(function (values) {
          resolve(values);
        }, function () {
          reject();
        });
      });
    },
    /**
     * @param {Array} data
     * @returns {Promise}
     */
    setRecords: function (data) {
      var me = this,
        forms = this.attributes.forms,
        addPromises = [],
        promises;

      return new Promise(function (resolve, reject) {
        if (!_.isArray(data)) {
          resolve();
          return;
        }
        while (forms.length > data.length) {
          me.remove(forms.length - 1);
        }
        while (forms.length + addPromises.length < data.length) {
          addPromises.push(me.add());
        }
        // wait for extra (blank) records to be added
        Promise.all(addPromises).then(function () {
          promises = [];
          data.forEach(function (record, index) {
            promises.push(forms.at(index).setRecord(record));
          });

          // wait for records to be populated
          Promise.all(promises).then(function (values) {
            resolve(values);
          }, function () {
            reject();
          });

        }, function () {
          reject();
        });
      });
    },
    data: function () {
      if (!arguments.length) {
        return this.getRecord();
      }
    }
  });
});

define('models/expression',[],function () {
  var Expression;

  /**
   * @param {Object} definition object { operator: String, operands: Array }
   * @constructor
   */
  Expression = function (definition) {
    var self = this,
      def = JSON.parse(JSON.stringify(definition));

    this.operator = def.operator.toLowerCase();
    this.operands = def.operands || [];
    this.operands.forEach(function (op, index) {
      if (_.isObject(op) && _.isString(op.operator)) {
        self.operands[index] = new Expression(op);
      }
    });
  };

  Expression.prototype.evaluate = function () {
    var args;
    if (!this.operator) {
      throw new Error('missing operator');
    }
    if (!Expression.fn[this.operator]) {
      throw new Error('unknown operator: ' + this.operator);
    }
    args = this.operands.map(function (op) {
      if (_.isString(op) || _.isNumber(op) || _.isBoolean(op) || _.isNull(op)) {
        // primitive types are fine
        return op;
      }
      if (op.evaluate) {
        return op.evaluate();
      }
      throw new Error('unexpected operand type');
    });
    return Expression.fn[this.operator].apply(this, args);
  };

  Expression.fn = {};

  // *** operands implements below this point ***

  Expression.fn.and = function () {
    var args = Array.prototype.slice.call(arguments);

    return args.every(function (arg) {
      return !!arg;
    });
  };
  Expression.fn.or = function () {
    var args = Array.prototype.slice.call(arguments);

    return args.some(function (arg) {
      return !!arg;
    });
  };
  Expression.fn.not = function (a) {
    return !a;
  };

  Expression.fn.empty = function (a) {
    if (_.isObject(a) || _.isString(a) || _.isArray(a)) {
      return _.isEmpty(a);
    }
    if (_.isNumber(a)) {
      return _.isNaN(a);
    }
    return !a;
  };
  Expression.fn['!empty'] = function (a) {
    return !Expression.fn.empty.call(this, a);
  };

  /*jslint eqeq:true*/
  Expression.fn['=='] = function (a, b) {
    return a == b;
  };
  Expression.fn['!='] = function (a, b) {
    return a != b;
  };
  /*jslint eqeq:false*/

  Expression.fn['<'] = function (a, b) {
    return a < b;
  };
  Expression.fn['<='] = function (a, b) {
    return a <= b;
  };
  Expression.fn['>'] = function (a, b) {
    return a > b;
  };
  Expression.fn['>='] = function (a, b) {
    return a >= b;
  };

  Expression.fn.contains = function (haystack, needle) {
    var found;
    if (!haystack || _.isEmpty(haystack)) {
      return false;
    }
    if (typeof haystack === 'string') {
      return haystack.indexOf(needle) !== -1;
    }
    /*jslint eqeq:true*/
    if (_.isArray(haystack)) {
      found = false;
      haystack.forEach(function (item) {
        if (item == needle) {
          found = true;
        }
      });
      return found;
    }
    /*jslint eqeq:false*/
    throw new Error('contains: unexpected operand type');
  };
  Expression.fn['!contains'] = function (haystack, needle) {
    return !Expression.fn.contains.call(this, haystack, needle);
  };


  return Expression;
});


define('models/behaviour',['require','collections/elements','models/expression'],function (require) {
  var Elements = require('collections/elements'),
    Behaviour,
    Expression = require('models/expression');

  Expression.fn['formelement.value'] = function (name) {
    return this.getElement(name).val();
  };

  Behaviour = Backbone.Model.extend({
    initialize: function () {
      var self = this;
      this.attributes.elements = new Elements();
      this.hookupTriggers();
      // TODO: find the best time to trigger this
      setTimeout(function () {
        self.attributes.elements.trigger('change');
      }, 0);
    },
    hookupTriggers: function () {
      var attrs = this.attributes,
        form = attrs.form,
        elements = attrs.elements;

      elements.off('change', this.runCheck, this);
      if (attrs.formElements === '*') {
        elements.set(form.attributes.elements.models);
      }
      elements.on('change', this.runCheck, this);
    },
    runCheck: function () {
      var check, exp;
      if (!this.attributes.check) {
        this.runActions(true);
        return;
      }
      if (this.attributes.check) {
        check = this.getCheck(this.attributes.check);
        if (check && check.exp) {
          this.bindExpressions();
          exp = new Expression(check.exp);
          this.runActions(exp.evaluate());
          this.unbindExpressions();
          return;
        }
      }
      // TODO: handle checks with functions
    },
    runActions: function (result) {
      var self = this;

      if (Array.isArray(this.attributes.actions)) {
        this.attributes.actions.forEach(function (action) {
          if (!action || (!_.isString(action) && !action.action)) {
            return;
          }
          if (result) {
            if (_.isString(action)) {
              self.runAction(action);
            } else {
              self.runAction(action.action);
            }
          } else if (action.autoReverse) {
            self.runAction(action.action, true);
          }
        });
      }
      if (Array.isArray(this.attributes.actionsIfFalse)) {
        this.attributes.actionsIfFalse.forEach(function (action) {
          if (!action || !action.action) {
            return;
          }
          if (!result) {
            if (_.isString(action)) {
              self.runAction(action);
            } else {
              self.runAction(action.action);
            }
          } else if (action.autoReverse) {
            self.runAction(action.action, true);
          }
        });
      }
    },
    runAction: function (name, isReversed) {
      var action = this.getAction(name),
        form = this.attributes.form,
        result;

      if (isReversed) {
        action = this.getReversedAction(action);
      }
      if (!action) {
        return;
      }
      // run javascript
      if (action.javascript) {
        result = this.runJavaScript(form, action.javascript);
      }
      // run manipulations
      if (Array.isArray(action.manipulations)) {
        action.manipulations.forEach(function (m) {
          // TODO: use computed manipulations
          form.getElement(m.target).set(_.clone(m.properties));
        });
      }
      // output result
      if (result !== undefined && action.outputTarget) {
        form.getElement(action.outputTarget).val(result);
      }
    },
    runJavaScript: function (form, string) {
      var js, result, placeholders, value;
      js = null;
      placeholders = string.match(/\[[\w\/\[\]]+\]/g);
      if (_.isArray(placeholders)) {
        placeholders.forEach(function (placeholder) {
          placeholder = placeholder.substring(1, placeholder.length - 1);
          try {
            value = form.getElement(placeholder).val();
            string = string.replace('[' + placeholder + ']', value);
          } catch (err) {
            // TODO: output a warning or something
            window.console.warn(err, string);
          }
        });
      }
      try {
        /*jslint evil:true*/
        eval('js = ' + string);
        /*jslint evil:false*/
        if (_.isFunction(js)) {
          result = js.call(form);
        } else {
          result = js;
        }
      } catch (err) {
        window.console.warn(err, string);
        // TODO: output a warning or something
      }
      return result;
    },
    getCheck: function (name) {
      try {
        return this.attributes.form.attributes._checks.filter(function (c) {
          return c.name === name;
        })[0];
      } catch (err) {
        return null;
      }
    },
    getAction: function (name) {
      try {
        return this.attributes.form.attributes._actions.filter(function (a) {
          return a.name === name;
        })[0];
      } catch (err) {
        return null;
      }
    },
    getReversedAction: function (action) {
      var isReversible;

      if (!action || action.javascript) {
        return null;
      }
      isReversible = true;
      action = JSON.parse(JSON.stringify(action));
      if (Array.isArray(action.manipulations)) {
        action.manipulations.forEach(function (m) {
          m.properties = m.properties || {};
          Object.keys(m.properties).forEach(function (k) {
            if (!_.isBoolean(m.properties[k])) {
              isReversible = false;
            } else {
              m.properties[k] = !m.properties[k];
            }
          });
        });
      }
      if (isReversible) {
        return action;
      }
      return null;
    },
    destroy: function () {
      this.attributes.elements.off('change', this.runCheck);
    },
    bindExpressions: function () {
      var unbound = Expression.fn['formelement.value'];
      Expression.fn['formelement.value'] = _.bind(
        Expression.fn['formelement.value'],
        this.attributes.form
      );
      Expression.fn['formelement.value']._unbound = unbound;
    },
    unbindExpressions: function () {
      var unbound = Expression.fn['formelement.value']._unbound;
      delete Expression.fn['formelement.value']._unbound;
      Expression.fn['formelement.value'] = unbound;
    }
  }, {
    // static properties
    /**
     * @param {Object} attrs attributes for this model.
     * @param {Form} form parent to associate with new Section.
     * @return {Behaviour} new Behaviour.
     */
    create: function (attrs, form) {
      var behaviour;

      if (!attrs || !_.isObject(attrs)) {
        return new Behaviour();
      }
      if (form) {
        attrs.form = form;
      }
      behaviour = new Behaviour(attrs);
      return behaviour;
    }
  });

  return Behaviour;
});


define('models/elements/heading',['models/element'], function (Element) {
  

  var HeadingElement = Element.extend({
    defaults: {
      page: 0,
      persist: false
    },
    initialize: function () {
      Element.prototype.initialize.call(this);
    }
  });

  return HeadingElement;
});



define('models/elements/message',['models/element'], function (Element) {
  

  var MessageElement = Element.extend({
    defaults: {
      page: 0,
      persist: false
    },
    initialize: function () {
      Element.prototype.initialize.call(this);
    },
    /**
     * official Blink API
     */
    val: function (value) {
      if (value === undefined) {
        return this.get('html');
      }
      this.set('html', value);
      return value;
    }
  });

  return MessageElement;
});



define('models/elements/date',[
  'models/element'
], function (Element) {
  

  var DateElement = Element.extend({
    initialize: function () {
      var attr = this.attributes,
        dateFormat,
        timeFormat,
        dateValue = null,
        timeValue = null;

      Element.prototype.initialize.call(this);
      this.on('change:_date change:_time', this.prepareValue);
      this.on('change:value', this.prepareDateTime);
      if (attr.defaultValue) {
        switch (attr.type) {
        case 'date':
          dateFormat = this.mapDateFormats[attr.dateFormat] || "YYYY-MM-DD";
          if (attr.defaultValue === 'now') {
            dateValue = moment();
          } else if (attr.defaultValue === 'now_plus') {
            dateValue = moment().add('d', parseInt(attr.defaultDateNowPlus, 10));
          } else if (attr.defaultValue === 'date') {
            dateValue = moment(attr.defaultDateDate);
          }
          if (dateValue !== null) {
            this.set('value', dateValue.format(dateFormat));
          }
          break;
        case 'time':
          timeFormat = this.mapTimeFormats[attr.timeFormat] || "HH:mm";
          if (attr.defaultValue === 'now') {
            timeValue = moment();
          } else if (attr.defaultValue === 'now_plus') {
            timeValue = moment().add('m', parseInt(attr.nowPlusAmount, 10));
          }
          if (timeValue !== null) {
            this.set('value', timeValue.format(timeFormat));
          }
          break;
        case 'datetime':
          dateFormat = this.mapDateFormats[attr.dateFormat] || "YYYY-MM-DD";
          timeFormat = this.mapTimeFormats[attr.timeFormat] || "HH:mm";
          if (attr.defaultValue === 'now') {
            timeValue = dateValue = moment();
          } else if (attr.defaultValue === 'now_plus') {
            timeValue = dateValue = moment();
            timeValue.add('m', parseInt(attr.nowPlusAmount, 10));
          }
          if (dateValue !== null) {
            this.attributes._date = dateValue.format(dateFormat);
            this.trigger('change:_date');
          }
          if (timeValue !== null) {
            this.attributes._time = timeValue.format(timeFormat);
            this.trigger('change:_time');
          }
          break;
        }
      }
    },
    initializeView: function () {
      var Forms = BMP.Forms,
        view,
        attr = this.attributes;

      this.removeView();

      if (parseInt(attr.nativeDatetimePicker, 10) === 1
          || parseInt(attr.nativeDatePicker, 10) === 1
          || parseInt(attr.nativeTimePicker, 10) === 1) {
        view = new Forms._views.DateElement({model: this});
      } else {
        view = new Forms._views.DatePickadateElement({model: this});
      }
      this.set('_view', view);
    },
    /**
     * update value to match _date and/or _time
     */
    prepareValue: function () {
      var type = this.attributes.type;
      if (type === 'date') {
        this.set('value', this.attributes._date);
      } else if (type === 'time') {
        this.set('value', this.attributes._time);
      } else { // type === 'datetime'
        // TODO: somehow stop this from firing twice
        this.set('value', this.attributes._date + 'T' + this.attributes._time);
      }
    },
    /**
     * update _date and/or _time to match value
     */
    prepareDateTime: function () {
      var type = this.attributes.type,
        value = this.attributes.value,
        time,
        date,
        parts;

      if (type === 'date') {
        this.set('_date', value);
      } else if (type === 'time') {
        this.set('_time', value);
      } else { // type === 'datetime'
        time = this.attributes._time;
        date = this.attributes._date;
        parts = value.split('T');
        if (parts[0]) {
          this.set('_date', parts[0], {silent: true});
        }
        if (parts[1]) {
          this.set('_time', parts[1], {silent: true});
        }
        if (time !== this.attributes._time) {
          this.trigger('change:_time');
        }
        if (date !== this.attributes._date) {
          this.trigger('change:_date');
        }
      }
    },
    /**
     * @return {Date} a JavaScript Date object.
     */
    toDate: function () {
      var type = this.attributes.type,
        iso;

      if (type === 'date') {
        return new Date(this.attributes._date);
      }
      if (type === 'time') {
        iso = (new Date()).toISOString();
        return iso.replace(/T[0-9.:Z+\-]*$/, 'T' + this.attributes._time);
      }
      // type === 'datetime'
      return new Date(this.attributes._date + 'T' + this.attributes._time);
    },
    mapDateFormats: {
      'yyyy_mm_dd': 'YYYY-MM-DD',
      'mm_dd_yyyy': 'MM-DD-YYYY',
      'dd_mm_yyyy2': 'DD/MM/YYYY',
      'yyyy_mm_dd2': 'YYYY/MM/DD',
      'mm_dd_yyyy2': 'MM/DD/YYYY',
      'dd_mm_yyyy': 'DD-MM-YYYY'
    },
    mapTimeFormats: {
      'hh:mm': 'HH:mm',
      'hh_mm_ss': 'HH:mm', //HH:MM:SS
      'h_mm_ss': 'hh:mm A',//HH:MM:SS AM/PM %r
      'h_mm': 'hh:mm A' //HH:MM AM/PM
    }
  });

  return DateElement;
});
define('models/elements/hidden',['models/element'], function (Element) {
  

  var HiddenElement = Element.extend({
    initialize: function () {
      Element.prototype.initialize.call(this);
    }
  });

  return HiddenElement;
});




define('models/elements/number',['models/element'], function (Element) {
  

  var NumberElement = Element.extend({
    initialize: function () {
      Element.prototype.initialize.call(this);
    },
    set: function (key, val, options) {
      var attrs;
      if (key === null) {
        return this;
      }
      if (_.isObject(key)) {
        attrs = key;
        options = val;
      } else {
        attrs = {};
        attrs[key] = val;
      }
      options = options || {};

      // tamper with 'value' if present
      if (attrs.hasOwnProperty('value') && attrs.value !== 'undefined' &&
          attrs.value !== null) {
        // TODO: round to 'step' if present with 'min' and/or 'max'
        attrs.value = Number(attrs.value);
      }
      return Element.prototype.set.call(this, attrs, options);
    },

    validators: {
      minValue: function (value, minValue) {
        return value < minValue;
      },
      maxValue: function (value, maxValue) {
        return value > maxValue;
      },
      maxDecimals: function (value, maxDecimals) {
        var regexp = new RegExp('^(?:\\d*\\.\\d{1,' + maxDecimals + '}|\\d+)$');
        return regexp.test(value);
      },
      minDecimals: function (value, minDecimals) {
        var regexp = new RegExp('^(?:\\d*\\.\\d{' + minDecimals + ',}|\\d+)$');
        return regexp.test(value);
      }
    },
    validate: function (attrs) {
      var errors = {};
      if (attrs === undefined) {
        attrs = this.attributes;
      }
      if (attrs.value) {
        if (this.validators.maxValue(attrs.value, attrs.max)) {
          errors.value = errors.value || [];
          errors.value.push({code: 'MAX', MAX: attrs.max});
        }
        if (this.validators.minValue(attrs.value, attrs.min)) {
          errors.value = errors.value || [];
          errors.value.push({code: 'MIN', MIN: attrs.min});
        }
        if (!this.validators.maxDecimals(attrs.value, attrs.maxDecimals)) {
          errors.value = errors.value || [];
          errors.value.push({code: 'MAXDECIMALS', MAX: attrs.maxDecimals});
        }
        if (attrs.minDecimals && !this.validators.minDecimals(attrs.value,
            attrs.minDecimals)) {
          errors.value = errors.value || [];
          errors.value.push({code: 'MINDECIMALS', MIN: attrs.minDecimals});
        }
      }
      return _.isEmpty(errors) ? undefined : errors;
    }
  });

  return NumberElement;
});

define('models/elements/telephone',['models/element'], function (Element) {
  

  var TelephoneElement = Element.extend({
    initialize: function () {
      Element.prototype.initialize.call(this);
    }
  });

  return TelephoneElement;
});



define('models/elements/text',['models/element'], function (Element) {
  

  var TextElement = Element.extend({
    initialize: function () {
      Element.prototype.initialize.call(this);
    },
    validate: function (attrs) {
      var errors = Element.prototype.validate.call(this) || {};
      if (attrs === undefined) {
        attrs = this.attributes;
      }

      if (attrs.value && attrs.maxLength) {
        if (attrs.value.length > attrs.maxLength) {
          errors.value = errors.value || [];
          errors.value.push({code: 'MAXLENGTH', MAX: attrs.maxLength});
        }
      }
      if (!_.isEmpty(errors)) {
        return errors;
      }
    }
  });

  return TextElement;
});



define('models/elements/password',['models/elements/text'], function (TextElement) {
  

  var PasswordElement = TextElement.extend({
    initialize: function () {
      TextElement.prototype.initialize.call(this);
    }
  });

  return PasswordElement;
});




define('models/elements/email',['models/elements/text'], function (TextElement) {
  

  var EmailElement = TextElement.extend({
    initialize: function () {
      TextElement.prototype.initialize.call(this);
    }
  });

  return EmailElement;
});




define('models/elements/url',['models/elements/text'], function (TextElement) {
  

  var URLElement = TextElement.extend({
    initialize: function () {
      TextElement.prototype.initialize.call(this);
    }
  });

  return URLElement;
});




define('models/elements/textarea',['models/elements/text'], function (TextElement) {
  

  var TextAreaElement = TextElement.extend({
    initialize: function () {
      TextElement.prototype.initialize.call(this);
    }
  });

  return TextAreaElement;
});




define('models/elements/boolean',['models/element'], function (Element) {
  

  var BooleanElement = Element.extend({
    initialize: function () {
      Element.prototype.initialize.call(this);
    }
  });

  return BooleanElement;
});



define('models/elements/select',['models/element'], function (Element) {
  

  var SelectElement = Element.extend({
    initialize: function () {
      Element.prototype.initialize.call(this);
    }
  });

  return SelectElement;
});



define('models/elements/multi',['models/elements/select'], function (SelectElement) {
  

  var MultiElement = SelectElement.extend({
    initialize: function () {
      SelectElement.prototype.initialize.call(this);
    }
  });

  return MultiElement;
});




define('models/elements/location',['models/element'], function (Element) {
  

  var LocationElement = Element.extend({
    initialize: function () {
      Element.prototype.initialize.call(this);
    },
    initializeView: function () {
      var Forms = BMP.Forms,
        view;

      this.removeView();

      view = new Forms._views.LocationElement({model: this});
      this.set('_view', view);
    },
    getGeoLocation: function (options) {
      var self = this,
        geolocation = window.navigator && window.navigator.geolocation,
        defaultOptions = {
          enableHighAccuracy: true,
          maximumAge: 5 * 60 * 1000, // 5 minutes
          timeout: 5 * 1000 // 5 seconds
        },
        errors = { value: [] };

      if (!geolocation || !geolocation.getCurrentPosition) {
        errors.value.push('unsupported in this browser');
        self.set('errors', errors);
        return;
      }
      options = $.isPlainObject(options) ? options : {};
      options = $.extend({}, defaultOptions, options);
      geolocation.getCurrentPosition(
        function (position) { // successCallback
          var coords;
          if (position.coords) {
            coords = {
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
              altitude: position.coords.altitude,
              accuracy: position.coords.accuracy,
              altitudeAccuracy: position.coords.altitudeAccuracy,
              heading: position.coords.heading,
              speed: position.coords.speed
            };
            self.set('value', coords);
          } else {
            errors.value.push('unable to determine position');
            self.set('errors', errors);
          }
        },
        function (error) { // errorCallback
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
          errors.value.push(string);
          self.set('errors', errors);
        },
        options
      );
    }
  });

  return LocationElement;
});
define('models/elements/file',['models/element'], function (Element) {
  

  var FileElement = Element.extend({
    initialize: function () {
      Element.prototype.initialize.call(this);
    },
    initializeView: function () {
      var Forms = BMP.Forms,
        view,
        accept = this.attributes.accept;

      this.removeView();

      if (window.PictureSourceType && window.navigator.camera &&
          window.navigator.camera.getPicture && accept.indexOf('image') === 0) {
        view = new Forms._views.BGImageElement({model: this});
      } else {
        view = new Forms._views.FileElement({model: this});
      }
      this.set('_view', view);
    }
  });

  return FileElement;
});
define('models/elements/draw',['models/element'], function (Element) {
  

  var DrawElement = Element.extend({
    initialize: function () {
      Element.prototype.initialize.call(this);
    },
    initializeView: function () {
      var Forms = BMP.Forms,
        navigator = window.navigator,
        view;

      this.removeView();

      if (navigator.bgtouchdraw && navigator.bgtouchdraw.getDrawing &&
          window.BGTouchDraw) {
        view = new Forms._views.BGDrawElement({model: this});
      } else {
        view = new Forms._views.DrawElement({model: this});
      }
      this.set('_view', view);
    }
  });

  return DrawElement;
});
define('main',['require','bicyclepump','models/form','models/elements/subform','models/behaviour','models/page','models/section','models/element','models/elements/heading','models/elements/message','models/elements/date','models/elements/hidden','models/elements/number','models/elements/telephone','models/elements/password','models/elements/email','models/elements/url','models/elements/text','models/elements/textarea','models/elements/boolean','models/elements/select','models/elements/multi','models/elements/location','models/elements/file','models/elements/draw'],function (require) {
  
  var Forms, BicyclePump;

  BicyclePump = require('bicyclepump');
  Forms = window.BMP.Forms;

  _.extend(Forms, Backbone.Events);

  Forms._models = {
    Form: require('models/form'),
    SubFormElement: require('models/elements/subform'),
    Behaviour: require('models/behaviour'),
    Page: require('models/page'),
    Section: require('models/section'),
    Element: require('models/element'),
    HeadingElement: require('models/elements/heading'),
    MessageElement: require('models/elements/message'),
    DateElement: require('models/elements/date'),
    HiddenElement: require('models/elements/hidden'),
    NumberElement: require('models/elements/number'),
    TelephoneElement: require('models/elements/telephone'),
    PasswordElement: require('models/elements/password'),
    EmailElement: require('models/elements/email'),
    URLElement: require('models/elements/url'),
    TextElement: require('models/elements/text'),
    TextAreaElement: require('models/elements/textarea'),
    BooleanElement: require('models/elements/boolean'),
    SelectElement: require('models/elements/select'),
    MultiElement: require('models/elements/multi'),
    LocationElement: require('models/elements/location'),
    FileElement: require('models/elements/file'),
    DrawElement: require('models/elements/draw')
  };

  Forms.models = new BicyclePump();
  Forms.views = new BicyclePump();

  /**
   * @param {Object} def definition of form to initialise.
   */
  Forms.initialize = function (def) {
    var form,
      view;

    if (!$.isPlainObject(def)) {
      throw new Error('unexpected Form definition structure');
    }
    form = Forms._models.Form.create(def);
    Forms.current = form;
    view = form.attributes._view = new Forms._views.Form({model: form});
    form.$form = view.$el; // backwards-compatibility, convenience
    view.render();
  };

  return Forms;
});



define('views/jqm/form',[],function () {
  var FormView = Backbone.View.extend({
    tagName: 'form',
    attributes: {
      'novalidate': 'novalidate'
    },
    remove: function () {
      this.$el.removeData('model');
      return Backbone.View.prototype.remove.call(this);
    },
    render: function () {
      var self = this,
        pages = this.model.attributes.pages;

      this.$el.empty();
      this.$el.attr('data-form', this.model.attributes.name);
      this.$el.data('model', this.model);
      pages.forEach(function (page) {
        var view = page.attributes._view;

        view.render();
        self.$el.append(view.el);
        setTimeout(function () {
          BMP.Forms.trigger('formReady', self.model);
        }, 197);
      });
      pages.goto(0);
    }
  });

  return FormView;
});

define('views/jqm/subform',['require','views/jqm/form'],function (require) {
  var Forms = BMP.Forms,
    FormView = require('views/jqm/form');

  return FormView.extend({
    tagName: 'section',
    attributes: {},
    remove: function () {
      this.$el.children('.ui-btn').children('button').off('click');
      return FormView.prototype.remove.call(this);
    },
    render: function () {
      var $button = $('<button></button>').attr({
        type: 'button',
        'data-icon': 'minus',
        'data-action': 'remove'
      }).text(this.model.attributes.name);

      $button.on('click', this.onRemoveClick);

      FormView.prototype.render.call(this);

      this.$el.prepend($button);
    },
    onRemoveClick: function () {
      var $form = Forms.getForm(this).$form;
      Forms.getElement($form).remove($form);
    }
  });
});

define('views/jqm/element',['rivets'], function (rivets) {
  return Backbone.View.extend({
    tagName: 'div',
    attributes: {
      'data-role': 'fieldcontain',
      'rv-class': 'm:class'
    },
    initialize: function () {
      var element = this.model;
      this.$el.attr('data-name', element.attributes.name);
      this.$el.data('model', element);
      this.bindRivets();
      element.on('change:errors', this.renderErrors, this);
      element.on('change:hidden', this.onChangeHidden, this);
    },
    remove: function () {
      this.$el.removeData('model');
      this.model.off(null, null, this);
      if (this.rivet) {
        this.rivet.unbind();
      }
      return Backbone.View.prototype.remove.call(this);
    },
    renderLabel: function () {
      var $label = $(document.createElement('label'));
      $label.attr({
        'rv-text': 'm:label',
        class: 'ui-input-text'
      });
      this.$el.append($label);
    },
    render: function () {
      throw new Error('Element.render is only an interface');
    },
    renderErrors: function () {
      var attrs, $errorList, errors, $errorElement, i18n;
      attrs = this.model.attributes;
      i18n = window.i18n['BMP/Forms/validation'];
      // TODO: do this via bindings with rivets
      if (this.$el.children('ul').length > 0) {
        this.$el.children('ul').remove();
      }
      $errorList = $(document.createElement('ul'));
      errors = attrs.errors || {};

      if (!_.isEmpty(errors)) {
        _.each(errors.value, function (error) {
          var text, fn;
          $errorElement = $(document.createElement('li'));
          fn = _.isFunction(i18n[error.code]) && i18n[error.code];
          if (error.code === 'PATTERN') {
            text = attrs.hint || attrs.toolTip || attrs.title;
          }
          if (!text) {
            text = fn ? fn(error) : JSON.stringify(error);
          }
          $errorElement.text(text);
          $errorList.append($errorElement);
        });
      }
//      $el = this.$el.find('[rv-value]');
//      if ($el.length && $el[0].checkValidity && !$el[0].checkValidity()) {
//        $errorElement = $(document.createElement('li'));
//        $errorElement.text('checkValidity error');
//        $errorList.append($errorElement);
//      }
      if (this.$el.children('ul').length === 0 && !_.isEmpty(errors)) {
        this.$el.append($errorList);
      }
    },
    onChangeHidden: function () {
      var hidden = this.model.attributes.hidden;
      if (hidden) {
        this.$el.hide();
      } else {
        this.$el.show();
      }
    },
    isHidden: function () {
      return this.$el && this.$el.css('display') === 'none';
    },
    bindRivets: function () {
      if (this.rivet) {
        this.rivet.unbind();
      }
      this.rivet = rivets.bind(this.el, {m: this.model});
    }
  });
});

define('views/jqm/elements/subform',['require','views/jqm/element'],function (require) {
  

  var ElementView = require('views/jqm/element');

  return ElementView.extend({
    tagName: 'section',
    remove: function () {
      this.$el.children('.ui-btn').children('button').off('click');
      return ElementView.prototype.remove.call(this);
    },
    render: function () {
      var name = this.model.attributes.subForm,
        $button = $('<button></button>').attr({
          type: 'button',
          'data-icon': 'plus',
          'data-action': 'add'
        }).text(name);

      $button.on('click', this.onAddClick);

      this.$el.attr('data-form', name);
      this.$el.prepend($button);
    },
    onAddClick: function () {
      var Forms = BMP.Forms,
        element = Forms.getElement(this);

      element.add();
    }
  });
});


define('views/jqm/section',[],function () {
  var SectionView = Backbone.View.extend({
    tagName: 'section',
    initialize: function () {
      var attrs = this.model.attributes;
      /*jslint sub:true*/ // IE8: reserved keywords can't be used as properties
      if (attrs['class']) {
        this.$el.addClass(attrs['class']);
      }
      /*jslint sub:false*/
    },
    render: function () {
      var self = this;

      this.$el.empty();
      this.model.get('elements').forEach(function (el) {
        var view = el.attributes._view,
          type = el.attributes.type;

        view.render();
        if (type === 'hidden') {
          self.$el.prepend(view.el);
        } else {
          self.$el.append(view.el);
        }
      });
    },
    show: function () {
      this.$el.show();
    },
    hide: function () {
      this.$el.hide();
    }
  });

  return SectionView;
});

define('views/jqm/page',['views/jqm/section'], function (SectionView) {
  var PageView = SectionView.extend({
    tagName: 'section',
    initialize: function () {
      var section = this.model;
      this.$el.attr('data-name', section.attributes.name);
      SectionView.prototype.initialize.call(this);
    },
    render: function () {
      SectionView.prototype.render.call(this);
      this.$el.hide();
    }
  });

  return PageView;
});

define('views/jqm/elements/heading',['views/jqm/element'], function (ElementView) {
  

  var TextElementView = ElementView.extend({
    attributes: {
      'rv-text': 'm:text'
    },
    initialize: function () {
      var $el;
      if (this.model && _.isNumber(this.model.attributes.level)) {
        this.tagName = 'h' + this.model.attributes.level;
        $el = $('<' + this.tagName + '></' + this.tagName + '>');
        $el.attr(this.attributes);
        this.setElement($el[0]);
      }
      ElementView.prototype.initialize.call(this);
    },
    render: function () {
      this.bindRivets();
    }
  });

  return TextElementView;
});


define('views/jqm/elements/message',['views/jqm/element'], function (ElementView) {
  

  var MessageElementView = ElementView.extend({
    tagName: 'div',
    attributes: {
      'rv-class': 'm:class'
    },
    render: function () {
      var element = this.model,
        $div;

      if (element.attributes.label) {
        this.$el.attr({
          'data-role': 'fieldcontain'
        });
        this.$el.empty();
        this.renderLabel();
        $div = $('<div></div>').attr({
          'rv-html': 'm:html',
          class: 'ui-input-text'
        });

        this.$el.append($div);

      } else {
        this.$el.attr({
          'rv-html': 'm:html'
        });
      }

      this.bindRivets();
    }
  });

  return MessageElementView;
});

define('views/jqm/elements/date',['views/jqm/element'], function (ElementView) {
  

  var DateElementView = ElementView.extend({
    renderDate: function () {
      var $input,
        name = this.model.attributes.name;

      // TODO: implement pre-HTML5 fallback
      $input = $('<input type="date" />');
      $input.attr({
        name: name + '_date',
        'rv-value': 'm:_date'
      });
      this.$el.append($input);

      return this;
    },
    renderTime: function () {
      var $input,
        name = this.model.attributes.name;

      // TODO: implement pre-HTML5 fallback
      $input = $('<input type="time" />');
      $input.attr({
        name: name + '_time',
        'rv-value': 'm:_time'
      });
      this.$el.append($input);

      return this;
    },
    render: function () {
      var type = this.model.get('type');

      this.$el.empty();
      this.renderLabel();

      if (type !== 'time') {
        this.renderDate();
      }
      if (type !== 'date') {
        this.renderTime();
      }

      this.bindRivets();
      return this;
    }
  });

  return DateElementView;
});



define('views/jqm/elements/date_pickadate',['views/jqm/elements/date'], function (DateView) {
  

  var DatePickadateElement = DateView.extend({
    renderDate: function () {
      var $input,
        attr = this.model.attributes,
        name = attr.name,
        self = this;

      //pre-HTML5 fallback
      $input = $('<input type="text" />');
      $input.attr({
        name: name + '_date',
        'rv-value': 'm:_date'
      });
      this.$el.append($input);
      BMP.Forms.once('formReady', function () {
        $input.pickadate(self.prepareDateSettings());
      });
      return this;
    },
    renderTime: function () {
      var $input,
        attr = this.model.attributes,
        name = attr.name,
        self = this;

      //pre-HTML5 fallback
      $input = $('<input type="text" />');
      $input.attr({
        name: name + '_time',
        'rv-value': 'm:_time'
      });
      this.$el.append($input);
      BMP.Forms.once('formReady', function () {
        $input.pickatime(self.prepareTimeSettings());
      });
      return this;
    },
    render: function () {
      var type = this.model.get('type');

      this.$el.empty();
      this.renderLabel();

      if (type !== 'time') {
        this.renderDate();
      }
      if (type !== 'date') {
        this.renderTime();
      }

      this.bindRivets();
      return this;
    },
    prepareDateSettings: function () {
      var attr = this.model.attributes,
        settings = {};

      settings.format = this.mapDateFormats[attr.dateFormat] || "yyyy-mm-dd";

      if (attr.dateAllowFrom) {
        switch (attr.dateAllowFrom) {
        case 'now':
          settings.min = new Date();
          break;
        case 'now_plus':
          settings.min = parseInt(attr.dateAllowFromNowPlus, 10);
          break;
        case 'date':
          settings.min = new Date(attr.dateAllowFromDate);
          break;
        }
      }

      if (attr.dateAllowTo) {
        switch (attr.dateAllowTo) {
        case 'now':
          settings.max = new Date();
          break;
        case 'now_plus':
          settings.max = parseInt(attr.dateAllowToNowPlus, 10);
          break;
        case 'date':
          settings.max = new Date(attr.dateAllowToDate);
          break;
        }
      }
      return settings;
    },
    prepareTimeSettings: function () {
      var attr = this.model.attributes,
        settings = {};

      settings.format = this.mapTimeFormats[attr.timeFormat] || "HH:i";
      if (attr.minuteStep) {
        settings.interval = parseInt(attr.minuteStep, 10);
      }
      return settings;
    },
    mapDateFormats: {
      'yyyy_mm_dd': 'yyyy-mm-dd',
      'mm_dd_yyyy': 'mm-dd-yyyy',
      'dd_mm_yyyy2': 'dd/mm/yyyy',
      'yyyy_mm_dd2': 'yyyy/mm/dd',
      'mm_dd_yyyy2': 'mm/dd/yyyy',
      'dd_mm_yyyy': 'dd-mm-yyyy'
    },
    mapTimeFormats: {
      'hh:mm': 'HH:i',
      'hh_mm_ss': 'HH:i', //HH:MM:SS
      'h_mm_ss': 'hh:i A',//HH:MM:SS AM/PM %r
      'h_mm': 'hh:i A' //HH:MM AM/PM
    }
  });

  return DatePickadateElement;
});



define('views/jqm/elements/hidden',['views/jqm/element'], function (ElementView) {
  

  var TextElementView = ElementView.extend({
    initialize: function () {
      // have to do this to stop Backbone from trying to change the "type"
      this.setElement($('<input type="hidden" />')[0]);
      ElementView.prototype.initialize.call(this);
    },
    render: function () {
      var name = this.model.get('name');

      this.$el.attr({
        name: name,
        'rv-value': 'm:value'
      });
      this.bindRivets();
    }
  });

  return TextElementView;
});



define('views/jqm/elements/number',['views/jqm/element'], function (ElementView) {
  

  var NumberElementView = ElementView.extend({
    render: function () {
      var $input,
        attrs = this.model.attributes,
        name = attrs.name,
        min = attrs.min,
        max = attrs.max;

      this.$el.empty();
      this.renderLabel();

      if (_.isNumber(min) && _.isNumber(max)) {
        $input = $('<input type="range" />');
        $input.attr({
          'data-highlight': true
        });

        $(document).one('pageinit', $.proxy(this.bindRivets, this));

      } else {
        // TODO: HTML4-fallback for buggy HTML5 browsers
        $input = $('<input type="number" />');
      }
      $input.attr({
        name: name,
        'rv-min': 'm:min',
        'rv-max': 'm:max',
        'rv-value': 'm:value',
        'rv-step': 'm:step'
      });
      this.$el.append($input);
      this.bindRivets();
    }
  });

  return NumberElementView;
});


define('views/jqm/elements/telephone',['views/jqm/element'], function (ElementView) {
  

  var TelephoneElementView = ElementView.extend({
    render: function () {
      var $input,
        name = this.model.get('name');

      this.$el.empty();
      this.renderLabel();

      $input = $('<input type="tel" />');
      $input.attr({
        name: name,
        'rv-value': 'm:value'
      });
      this.$el.append($input);
      this.bindRivets();
    }
  });

  return TelephoneElementView;
});

define('views/jqm/elements/text',['views/jqm/element'], function (ElementView) {
  

  var TextElementView = ElementView.extend({
    render: function () {
      var $input,
        name = this.model.get('name');

      this.$el.empty();
      this.renderLabel();

      $input = $('<input type="text" />');
      $input.attr({
        name: name,
        'rv-value': 'm:value'
      });
      this.$el.append($input);
      this.bindRivets();
    }
  });

  return TextElementView;
});

define('views/jqm/elements/password',['views/jqm/elements/text'], function (TextElementView) {
  

  var PasswordElementView = TextElementView.extend({
    render: function () {
      var $input,
        name = this.model.get('name');

      this.$el.empty();
      this.renderLabel();

      $input = $('<input type="password" />');
      $input.attr({
        name: name,
        'rv-value': 'm:value'
      });
      this.$el.append($input);
      this.bindRivets();
    }
  });

  return PasswordElementView;
});




define('views/jqm/elements/email',['views/jqm/elements/text'], function (TextElementView) {
  

  var EmailElementView = TextElementView.extend({
    render: function () {
      var $input,
        name = this.model.get('name');

      this.$el.empty();
      this.renderLabel();

      $input = $('<input type="email" />');
      $input.attr({
        name: name,
        'rv-value': 'm:value'
      });
      this.$el.append($input);
      this.bindRivets();
    }
  });

  return EmailElementView;
});



define('views/jqm/elements/url',['views/jqm/elements/text'], function (TextElementView) {
  

  var URLElementView = TextElementView.extend({
    render: function () {
      var $input,
        name = this.model.get('name');

      this.$el.empty();
      this.renderLabel();

      $input = $('<input type="text" />');
      $input.attr({
        name: name,
        'rv-value': 'm:value'
      });
      this.$el.append($input);
      this.bindRivets();
    }
  });

  return URLElementView;
});



define('views/jqm/elements/textarea',['views/jqm/elements/text'], function (TextElementView) {
  

  var TextAreaElementView = TextElementView.extend({
    render: function () {
      var $input,
        name = this.model.get('name');

      this.$el.empty();
      this.renderLabel();

      $input = $('<textarea></textarea>');
      $input.attr({
        name: name,
        'rv-value': 'm:value'
      });
      this.$el.append($input);
      this.bindRivets();
    }
  });

  return TextAreaElementView;
});



define('views/jqm/elements/boolean',['views/jqm/element'], function (ElementView) {
  

  var BooleanElementView = ElementView.extend({
    render: function () {
      var $input;

      this.$el.empty();
      this.renderLabel();

      $input = $('<select></select>');
      $input.attr({
        'rv-value': 'm:value',
        'data-role': 'slider'
      });

      _.forEach(this.model.attributes.options, function (label, value) {
        var $option = $('<option value="' + value + '">' + label + '</option>');
        $input.append($option);
      });

      this.$el.append($input);
      this.bindRivets();
      this.model.on('change:value', this.onValueChange, this);
    },
    onValueChange: function () {
      this.$el.children('select').slider('refresh');
    }
  });

  return BooleanElementView;
});



define('views/jqm/elements/choice',['views/jqm/element'], function (ElementView) {
  

  var ChoiceElementView = ElementView.extend({

    renderOtherText: function ($values) {
      var name = this.model.attributes.name,
        $input = $('<input type="text" />'),
        $label = '<label rv-text="m:label" class="ui-input-text"></label>',
        $element = $('<div data-role="fieldcontain"></div>'),
        $div = $('<div class="ui-input-text"></div>'),
        isOtherRendered = !!this.$el.find('div[data-role=fieldcontain]').length;

      $element.addClass('ui-field-contain ui-body ui-br');
      $div.addClass('ui-shadow-inset ui-corner-all ui-btn-shadow ui-body-c');

      $input.attr({
        name: name + '_other',
        class: 'ui-input-text ui-body-c'
      });
      if ($.inArray('other', $values) >= 0 && !isOtherRendered) {
        $element.append($label);
        $div.append($input);
        $element.append($div);
        this.$el.append($element);
      } else if ($.inArray('other', $values) < 0 && isOtherRendered) {
        this.$el.children('div[data-role=fieldcontain]').remove();
      }
    }

  });

  return ChoiceElementView;
});

define('views/jqm/elements/choicecollapsed',['views/jqm/elements/choice'], function (ChoiceElementView) {
  

  var ChoiceCollapsedElementView = ChoiceElementView.extend({
    render: function () {
      var $input, $otherOption,
        type = this.model.attributes.type,
        name = this.model.attributes.name;

      this.$el.empty();
      this.renderLabel();

      $input = $('<select></select>');
      $input.attr({
        'rv-value': 'm:value'
      });

      if (type === 'select') {
        $input.attr({
          name: name
        });
        $input.append('<option>select one...</option>');
      } else { // type === 'multi'
        $input.attr({
          name: name + '[]',
          multiple: 'multiple',
          // TODO: detect if native menu actually works and enable it
          'data-native-menu': false
        });
        $input.append('<option>select one or more...</option>');
      }

      _.forEach(this.model.attributes.options, function (label, value) {
        var $option = $('<option value="' + value + '">' + label + '</option>');
        $input.append($option);
      });
      if (this.model.attributes.other) {
        $otherOption = $('<option value="other">other</option>');
        $input.append($otherOption);
      }
      this.$el.append($input);

      this.bindRivets();
      this.model.on('change:value', this.onValueChange, this);
    },
    onValueChange: function () {
      this.$el.find('select').selectmenu('refresh');
      var $values = this.$el.find('.ui-btn-text').text().split(','),
        $mapValues = $.map($values, function (val) {
          return val.trim();
        });
      ChoiceElementView.prototype.renderOtherText.call(this, $mapValues);
    }
  });

  return ChoiceCollapsedElementView;
});



define('views/jqm/elements/choiceexpanded',['views/jqm/elements/choice'], function (ChoiceElementView) {
  

  var ChoiceExpandedElementView = ChoiceElementView.extend({
    remove: function () {
      var type = this.attributes.type;
      if (type !== 'select') {
        this.$el.find('input').off('click');
      }
      return ChoiceElementView.prototype.remove.call(this);
    },
    render: function () {
      var self = this,
        $fieldset,
        $legend,
        attrs = this.model.attributes,
        type = attrs.type,
        name = attrs.name,
        options = attrs.options,
        iType = type === 'select' ? 'radio' : 'checkbox',
        iName = type === 'select' ? name + '_' + self.cid : name + '[]';

      this.$el.empty();

      $fieldset = $('<fieldset></fieldset>').attr({
        'data-role': 'controlgroup'
      });
      if (attrs.layout === 'horizontal') {
        $fieldset.attr({
          'data-type': 'horizontal'
        });
      }
      $legend = $('<legend></legend>').text(attrs.label);
      $fieldset.prepend($legend);

      if (this.model.attributes.other) {
        options.other = 'other';
      }

      _.forEach(options, function (label, value) {
        var $label = $('<label>' + label + '</label>'),
          $input = $('<input type="' + iType + '" />');

        $input.attr({
          name: iName,
          'rv-checked': 'm:value',
          value: value
        });
        $label.prepend($input);
        $fieldset.append($label);
      });

      this.$el.append($fieldset);
      if (type === 'select') {
        this.bindRivets();
        this.model.on('change:value', this.onSelectValueChange, this);
      } else { // type === 'multi'
        // bind custom handler for checkboxes -> array
        // Note: jQM uses triggerHandler, so this has to be a direct event
        $fieldset.find('input').on('click', {
          view: this,
          model: this.model
        }, this.onMultiInputClick);
        // bind custom handler for checkboxes <- array
        this.model.on('change:value', this.onMultiValueChange, this);
      }
    },
    onMultiInputClick: function (event) {
      var view = event.data.view,
        model = event.data.model,
        $inputs = view.$el.find('input:checked'),
        val;

      val = _.map($inputs, function (input) {
        return $(input).val();
      });
      model.set('value', val);
    },
    onMultiValueChange: function () {
      var view = this, $values, values,
        model = this.model,
        $inputs = view.$el.find('input[type=radio],input[type=checkbox]'),
        value = model.attributes.value;

      if (!_.isArray(value)) {
        value = [];
      }
      /*jslint unparam:true*/
      $inputs.each(function (index, input) {
        var $input = $(input);
        $input.prop('checked', _.indexOf(value, $input.val()) !== -1);
      });
      /*jslint unparam:false*/

      $inputs.checkboxradio('refresh');
      $values = this.$el.find('label[data-icon=checkbox-on]');

      values = $.map($values, function (val) {
        return $(val).text().trim();
      });
      ChoiceElementView.prototype.renderOtherText.call(this, values);
    },
    onSelectValueChange: function () {
      var view = this, $values, values,
        $inputs = view.$el.find('input[type=radio],input[type=checkbox]');

      $inputs.checkboxradio('refresh');
      $values = this.$el.find('label[data-icon=radio-on]');

      values = $.map($values, function (val) {
        return $(val).text().trim();
      });
      ChoiceElementView.prototype.renderOtherText.call(this, values);
    }
  });

  return ChoiceExpandedElementView;
});



define('views/jqm/elements/location',['views/jqm/element'], function (ElementView) {
  
  var LocationElementView = ElementView.extend({
    render: function () {
      var $button, $div;

      this.$el.empty();
      this.renderLabel();

      $button = $('<button />');
      $button.text('Detect Location');

      $div = $('<div class="ui-input-text"></div>');
      $div.append($button);

      this.$el.append($div);

      $button.on('click', $.proxy(LocationElementView.onButtonClick, this));

      this.bindRivets();
      this.model.on('change:value', this.renderFigure, this);
    },
    renderFigure: function () {
      var $figure, $figcaption, loc, $img, caption, staticMap;
      loc = this.model.attributes.value;
      this.$el.children('figure').remove();
      if (!loc || !loc.latitude || !loc.longitude) {
        return;
      }
      $figure = $('<figure></figure>');
      $figcaption = $('<figcaption></figcaption>').appendTo($figure);
      caption = 'lat: ' + loc.latitude + '; long: ' + loc.longitude;
      if (loc.accuracy) {
        caption += '; &plusmn;' + loc.accuracy + 'M';
      }
      $figcaption.html(caption);
      $img = $('<img />');
      staticMap = 'http://maps.google.com/maps/api/staticmap?markers=';
      staticMap += loc.latitude + ',' + loc.longitude;
      staticMap += '&size=300x200&zoom=20&maptype=hybrid&sensor=true';
      $img.attr('src', staticMap);
      $img.css({
        'max-height': '7em',
        'max-width': '100%'
      });
      $figure.append($img);
      this.$el.append($figure);
    },
    remove: function () {
      this.$el.children('button').off('click');
      this.model.off('change:value', this.renderFigure, this);
      return ElementView.prototype.remove.call(this);
    }
  }, {
    // static properties and methods
    onButtonClick: function (event) {
      this.model.getGeoLocation();
      event.preventDefault();
      return false;
    }
  });

  return LocationElementView;
});


define('views/jqm/elements/file',['views/jqm/element'], function (ElementView) {
  
  var FileElementView, humanizeBytes;

  /**
   * @param {Number} size in bytes
   * @return {String}
   */
  humanizeBytes = function (size) {
    var units = ['bytes', 'KB', 'MB', 'GB'],
      unitIndex = 0,
      divisor = 1;

    while (size > (divisor * 1024) && unitIndex < units.length) {
      divisor *= 1024;
      unitIndex += 1;
    }

    size = Math.round(1e1 * size / divisor) / 1e1;

    return size + ' ' + units[unitIndex];
  };

  FileElementView = ElementView.extend({
    render: function () {
      var self = this,
        $input,
        name = this.model.get('name');

      this.$el.empty();
      this.renderLabel();

      $input = $('<input type="file" />');
      $input.attr({
        name: name,
        'rv-accept': 'm:accept'
      });
      $input.prop('capture', !!this.model.get('capture'));
      this.$el.append($input);

      this.bindRivets();
      $input.on('change', function (event) {
        self.onInputChange(event);
      });
      this.model.on('change:blob', this.renderFigure, this);
    },
    renderFigure: function () {
      var $figure, $figcaption, blob, caption, $img;
      blob = this.model.attributes.blob;
      this.$el.children('figure').remove();
      if (!blob) {
        return;
      }
      caption = [];
      $figure = $('<figure></figure>');
      $figcaption = $('<figcaption></figcaption>').appendTo($figure);
      if (blob.type) {
        caption.push(blob.type);
      }
      if (blob.size && _.isNumber(blob.size)) {
        caption.push(humanizeBytes(blob.size));
      }
      $figcaption.html(caption.join(' &mdash; '));
      if (_.isString(blob.type) && blob.type.indexOf('image/') === 0) {
        $img = $('<img />');
        $img.attr('src', blob.toDataURI());
        $img.css({
          'max-height': '6em',
          'max-width': '100%'
        });
        $figure.append($img);
      }
      this.$el.append($figure);
    },
    remove: function () {
      this.$el.children('input').off('change');
      this.model.off('change:blob', this.renderFigure, this);
      return ElementView.prototype.remove.call(this);
    },
    onInputChange: function (event) {
      var self = this,
        $input = event && $(event.target),
        fileInput = $input.data('fileInput');

      if (fileInput.size()) {
        fileInput.getBlob().then(function (blob) {
          self.model.set('blob', blob);
        });
      }
    }
  });

  return FileElementView;
});


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


define('text!views/jqm/templates/signaturePad.html',[],function () { return '<div id="bmp-forms-dialog-signature" data-role="popup" class="ui-content">\n    <form method="post" action="" class="sigPad">\n        <div class="sig sigWrapper">\n            <div class="typed"></div>\n            <canvas class="pad" style="cursor: crosshair; -ms-touch-action: none;"></canvas>\n            <input type="hidden" name="output" class="output">\n        </div>\n        <fieldset class="ui-grid-a">\n            <div class="ui-block-a">\n                <button type="submit" data-role="button">Done</button>\n            </div>\n            <div class="ui-block-b">\n                <!--<button type="reset" data-role="button">Reset</button>-->\n                <button data-action="clear" data-role="button">Clear</button>\n            </div>\n        </fieldset>\n    </form>\n</div>\n';});

define('views/jqm/elements/draw',[
  'views/jqm/element',
  'views/jqm/elements/file',
  'text!views/jqm/templates/signaturePad.html'
], function (ElementView, FileElementView, html) {
  
  var signaturePad, DrawElementView;

  DrawElementView = FileElementView.extend({
    render: function () {
      var $button, $div;

      this.$el.empty();
      this.renderLabel();

      $button = $('<button />');
      $button.text('Signature');

      $div = $('<div class="ui-input-text"></div>');
      $div.append($button);

      this.$el.append($div);

      $button.on('click', $.proxy(DrawElementView.onButtonClick, this));

      this.bindRivets();
      this.model.on('change:blob', this.renderFigure, this);
    },
    remove: function () {
      this.$el.children('button').off('click');
      this.model.off('change:blob', this.renderFigure, this);
      return ElementView.prototype.remove.call(this);
    }
  }, {
    // static properties and methods
    onSignatureSubmit: function (event) {
      var data = signaturePad.getSignatureImage('image/jpeg'),
        blob;

      if (data.indexOf('data:') !== 0) {
        data = 'data:image/jpeg;base64,' + data;
      }
      blob = BMP.Blob.fromDataURI(data);
      this.model.set('blob', blob);
      $('#bmp-forms-dialog-signature').popup('close');
      event.preventDefault();
      return false;
    },
    onSignatureClear: function (event) {
      this.model.unset('blob');
      $('#bmp-forms-dialog-signature').popup('close');
      event.preventDefault();
      return false;
    },
    onButtonClick: function (event) {
      var $div = $(html),
        options = {
          dismissible: true,
          history: false,
          afterclose: function (event, ui) {
            if (event && ui) {
              $div.remove();
              signaturePad = null;
            }
          }
        },
        $window = $(window),
        $form,
        windowX = $window.innerWidth(),
        windowY = $window.innerHeight();

      //$div.hide();
      $div.find('[data-role=header] > h2').text(this.model.get('label'));
      $(document.body).append($div);
      $div.find('canvas').attr({
        height: Math.min(Math.floor((windowX - 60) * 4 / 9), windowY - 60),
        width: windowX - 60
      });
      $form = $div.children('form');
      $form.on('submit', $.proxy(DrawElementView.onSignatureSubmit, this));
      signaturePad = $form.signaturePad({
        drawOnly: true,
        validateFields: false,
        lineWidth: 0,
        output: null,
        sigNav: null,
        name: null,
        typed: null,
        clear: 'input[type=reset]',
        typeIt: null,
        drawIt: null,
        typeItDesc: null,
        drawItDesc: null
      });
      $form.trigger('create');
      $div.popup(options);
      $div.popup('open');
      $form.on('click', '[data-action=clear]',
        $.proxy(DrawElementView.onSignatureClear, this));
      event.preventDefault();
      return false;
    }
  });

  return DrawElementView;
});


define('views/jqm/elements/bg_draw',[
  'views/jqm/element',
  'views/jqm/elements/file'
], function (ElementView, FileElementView) {
  
  var BGDrawElementView;

  BGDrawElementView = FileElementView.extend({
    render: function () {
      var $button, $div;

      this.$el.empty();
      this.renderLabel();

      $button = $('<button />');
      $button.text('Signature');

      $div = $('<div class="ui-input-text"></div>');
      $div.append($button);

      this.$el.append($div);

      $button.on('click', $.proxy(BGDrawElementView.onButtonClick, this));

      this.bindRivets();
      this.model.on('change:blob', this.renderFigure, this);
    },
    remove: function () {
      this.$el.children('button').off('click');
      this.model.off('change:blob', this.renderFigure, this);
      return ElementView.prototype.remove.call(this);
    }
  }, {
    onButtonClick: function (event) {
      var model = this.model,
        $button = $(event.target),
        $window = $(window),
        offset = $button.offset(),
        width = $button.width(),
        defaults = {
          canvasButtonOriginX: 320,
          canvasButtonOriginY: 320,
          canvasWidth: 600,
          canvasHeight: 300,
          destinationType: window.BGTouchDraw.DestinationType.DATA_URL,
          encodingType: window.BGTouchDraw.EncodingType.JPEG
        },
        options = {};

      options.canvasButtonOriginX = offset.left + Math.floor(width / 2);
      options.canvasButtonOriginY = offset.top - $window.scrollTop();

      options = $.extend({}, defaults, options);
      window.navigator.bgtouchdraw.getDrawing(function (data) {
        var blob = window.BMP.Blob.fromDataURI(data);
        if (blob) {
          model.set('blob', blob);
        }
      }, $.noop, options);
      event.preventDefault();
      return false;
    }
  });

  return BGDrawElementView;
});



define('text!views/jqm/templates/bg_image.html',[],function () { return '<div class="ui-grid-a">\n    <div class="ui-block-a">\n        <button></button>\n    </div>\n    <div class="ui-block-b">\n        <button></button>\n    </div>\n</div>';});

define('views/jqm/elements/bg_image',[
  'views/jqm/element',
  'views/jqm/elements/file',
  'text!views/jqm/templates/bg_image.html'
], function (ElementView, FileElementView, html) {
  
  var BGCameraElementView;

  BGCameraElementView = FileElementView.extend({
    render: function () {
      var $new, $existing, $div;

      this.$el.empty();
      this.renderLabel();

      $div = $('<div class="ui-input-text"></div>');
      $div.append(html);

      $new = $div.find('button').first();
      $new.text('Camera');
      $new.data('SourceType', window.PictureSourceType.CAMERA);

      $existing = $div.find('button').last();
      $existing.text('Gallery');
      $existing.data('SourceType', window.PictureSourceType.PHOTO_LIBRARY);

      this.$el.append($div);

      $new.on('click', $.proxy(BGCameraElementView.onButtonClick, this));
      $existing.on('click', $.proxy(BGCameraElementView.onButtonClick, this));

      this.bindRivets();
      this.model.on('change:blob', this.renderFigure, this);
    },
    remove: function () {
      this.$el.find('button').off('click');
      this.model.off('change:blob', this.renderFigure, this);
      return ElementView.prototype.remove.call(this);
    }
  }, {
    onButtonClick: function (event) {
      var model = this.model,
        $button = $(event.target),
        options = {};

      options.sourceType = $button.data('SourceType');
      window.navigator.camera.getPicture(function (data) {
        var blob = window.BMP.Blob.fromDataURI(data);
        if (blob) {
          model.set('blob', blob);
        }
      }, $.noop, options);
      event.preventDefault();
      return false;
    }
  });

  return BGCameraElementView;
});


/*jslint indent:2*/
define('views/forms3jqm',['require','rivets','main','views/jqm/form','views/jqm/subform','views/jqm/elements/subform','views/jqm/page','views/jqm/section','views/jqm/element','views/jqm/elements/heading','views/jqm/elements/message','views/jqm/elements/date','views/jqm/elements/date_pickadate','views/jqm/elements/hidden','views/jqm/elements/number','views/jqm/elements/telephone','views/jqm/elements/password','views/jqm/elements/email','views/jqm/elements/url','views/jqm/elements/text','views/jqm/elements/textarea','views/jqm/elements/boolean','views/jqm/elements/choicecollapsed','views/jqm/elements/choiceexpanded','views/jqm/elements/location','views/jqm/elements/file','views/jqm/elements/draw','views/jqm/elements/bg_draw','views/jqm/elements/bg_image'],function (require) {
  var Forms, rivets;
  rivets = require('rivets');
  Forms = require('main');

  $.mobile.page.prototype.options.keepNative = '[type^=time], [type^=date]';

  rivets.adapters[':'] = {
    subscribe: function (obj, keypath, callback) {
      obj.on('change:' + keypath, callback);
    },
    unsubscribe: function (obj, keypath, callback) {
      obj.off('change:' + keypath, callback);
    },
    read: function (obj, keypath) {
      return obj.get(keypath);
    },
    publish: function (obj, keypath, value) {
      obj.set(keypath, value);
    }
  };

  /**
   * @param {Node|jQuery} element where to start looking.
   */
  Forms.getForm = function (element) {
    var cfo = Forms.current,
      $element = element instanceof $ ? element : $(element),
      $next = $element.closest('[data-form]'),
      form;

    while ($next.length > 0) {
      if ($.hasData($next[0])) {
        form = $next.data('model');
        if (form instanceof Forms._models.Form) {
          return form;
        }
      }
      $next = $element.parent().closest('[data-form]');
    }
    if (cfo && cfo.$form && cfo.$form.parent().length > 0) {
      return Forms.current;
    }
    return null;
  };

  /**
   * @param {Node|jQuery} element where to start looking.
   */
  Forms.getElement = function (element) {
    var $element = element instanceof $ ? element : $(element),
      $next = $element.closest('[data-name]'),
      el;

    while ($next.length > 0) {
      if ($.hasData($next[0])) {
        el = $next.data('model');
        if (el instanceof Forms._models.Element) {
          return el;
        }
      }
      $next = $element.parent().closest('[data-name]');
    }
    return null;
  };

  return {
    Form: require('views/jqm/form'),
    SubForm: require('views/jqm/subform'),
    SubFormElement: require('views/jqm/elements/subform'),
    Page: require('views/jqm/page'),
    Section: require('views/jqm/section'),
    Element: require('views/jqm/element'),
    HeadingElement: require('views/jqm/elements/heading'),
    MessageElement: require('views/jqm/elements/message'),
    DateElement: require('views/jqm/elements/date'),
    DatePickadateElement: require('views/jqm/elements/date_pickadate'),
    HiddenElement: require('views/jqm/elements/hidden'),
    NumberElement: require('views/jqm/elements/number'),
    TelephoneElement: require('views/jqm/elements/telephone'),
    PasswordElement: require('views/jqm/elements/password'),
    EmailElement: require('views/jqm/elements/email'),
    URLElement: require('views/jqm/elements/url'),
    TextElement: require('views/jqm/elements/text'),
    TextAreaElement: require('views/jqm/elements/textarea'),
    BooleanElement: require('views/jqm/elements/boolean'),
    ChoiceCollapsedElement: require('views/jqm/elements/choicecollapsed'),
    ChoiceExpandedElement: require('views/jqm/elements/choiceexpanded'),
    LocationElement: require('views/jqm/elements/location'),
    FileElement: require('views/jqm/elements/file'),
    DrawElement: require('views/jqm/elements/draw'),
    BGDrawElement: require('views/jqm/elements/bg_draw'),
    BGImageElement: require('views/jqm/elements/bg_image')
  };
});


  require(['models/expression'], function (Expression) {
    BMP.Expression = Expression;
  });

  require(['main'], function(Forms) {
    try {
      Forms._views = require('views/forms3jqm');
    } catch (err) {}
  });

  return BMP.Forms;
}));


(function(){ window.i18n || (window.i18n = {}) 
var MessageFormat = { locale: {} };
MessageFormat.locale.en=function(n){return n===1?"one":"other"}
var
c=function(d){if(!d)throw new Error("MessageFormat: No data passed to function.")},
n=function(d,k,o){if(isNaN(d[k]))throw new Error("MessageFormat: `"+k+"` isnt a number.");return d[k]-(o||0)},
v=function(d,k){c(d);return d[k]},
p=function(d,k,o,l,p){c(d);return d[k] in p?p[d[k]]:(k=MessageFormat.locale[l](d[k]-o),k in p?p[k]:p.other)},
s=function(d,k,p){c(d);return d[k] in p?p[d[k]]:p.other};
window.i18n["BMP/Forms/validation"] = {
"MAX":function(d){return "must not be higher than "+v(d,"MAX")},
"MIN":function(d){return "must not be lower than "+v(d,"MIN")},
"MAXDECIMALS":function(d){return "no more than "+v(d,"MAX")+" "+p(d,"MAX",0,"en",{"one":"value","other":"values"})+" after the decimal"},
"MINDECIMALS":function(d){return "needs at least "+v(d,"MIN")+" "+p(d,"MIN",0,"en",{"one":"value","other":"values"})+" after the decimal"},
"MAXLENGTH":function(d){return "no longer than "+v(d,"MAX")+" "+p(d,"MAX",0,"en",{"one":"character","other":"characters"})},
"PATTERN":function(d){return "must match this pattern: "+v(d,"PATTERN")},
"REQUIRED":function(d){return "must not be empty"}}
})();