// AMD-detection borrowed from Kris Kowal's Q
// https://github.com/kriskowal/q/blob/master/q.js#L29
/*jslint sloppy:true*/ // don't force ES5 strict mode (need globals here)
(function (definition) {
  if (typeof define === "function" && define.amd) {
    // Require.JS
    define([
      'jquery',
      'underscore',
      'backbone',
      'rivets',
      'q',
      'jquerymobile'
    ], definition);

  } else {
    // no Require.JS, no AMD modules
    definition($, _, Backbone, rivets, Q);
  }
}(function($, _, Backbone, rivets, Q) {
  'use strict';
/*jslint sloppy:false*/ // let JSLint bug us again about ES5 strict mode
  var BlinkForms = window['BlinkForms'] = {};

/**
 * almond 0.2.4 Copyright (c) 2011-2012, The Dojo Foundation All Rights Reserved.
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
        aps = [].slice;

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
        var nameParts, nameSegment, mapValue, foundMap,
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

                name = baseParts.concat(name.split("/"));

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
            usingExports;

        //Use name if no relName
        relName = relName || name;

        //Call the callback to define the module, if necessary.
        if (typeof callback === 'function') {

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

            ret = callback.apply(defined[name], args);

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
        config = cfg;
        return req;
    };

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


define('models/element',[],function() {
  var Element = Backbone.Model.extend({
    defaults: {
      page: 0,
      defaultValue: '',
      value: ''
    },
    idAttribute: 'name',
    initialize: function() {
      var attrs = this.attributes,
          form = attrs.form,
          page = attrs.page,
          section = $.trim(attrs.section || '');

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

      this.set('value', this.attributes.defaultValue);
      if (!this.attributes.label) {
        if(this.attributes.prefix){
           this.set('label', this.attributes.name + ' '+ this.attributes.prefix);       
        }else{
            this.set('label', this.attributes.name);
        }
      }
    },
    validate: function(attrs) {
        var errors = {};
      if (attrs === undefined) {
        attrs = this.attributes;
      }
      if (attrs.required && !attrs.value) {
        errors.value = errors.value || [];
        errors.value.push({ code: "REQUIRED" });
      }
      if (!_.isEmpty(errors)) {
        return errors;
      }
    },
    destroy: function(options) {
      var attrs = this.attributes;
      if (attrs._view) {
        attrs._view.remove();
        delete attrs._view;
      }
      delete attrs.form;
      delete attrs.page;
      delete attrs.section;
      this.id = null; // to prevent "sync"
      return Backbone.Model.prototype.destroy.call(this, options);
    },
    /**
     * official Blink API
     */
    val: function(value) {
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
     */
    create: function(attrs, form) {
      var Forms = window.BlinkForms,
          view,
          el,
          TypedElement,
          View,
          mode;

      if (!attrs || !_.isObject(attrs)) {
        return new Element();
      }
      if (form) {
        attrs.form = form;
      }
      // TODO: determine Element type and select sub-Prototype
      switch (attrs.type) {
        case 'subForm':
          TypedElement = Forms._models.SubFormElement;
          View = Forms._views.SubFormElement;
          break;
        case 'heading':
          TypedElement = Forms._models.HeadingElement;
          View = Forms._views.HeadingElement;
          break;
        case 'message':
          TypedElement = Forms._models.MessageElement;
          View = Forms._views.MessageElement;
          break;
        case 'boolean':
          TypedElement = Forms._models.BooleanElement;
          View = Forms._views.BooleanElement;
          break;
        case 'select':
          TypedElement = Forms._models.SelectElement;
          mode = attrs.mode;
          mode = mode[0].toUpperCase() + mode.substring(1);
          View = Forms._views['Choice' + mode + 'Element'];
          break;
        case 'multi':
          TypedElement = Forms._models.MultiElement;
          mode = attrs.mode;
          mode = mode[0].toUpperCase() + mode.substring(1);
          View = Forms._views['Choice' + mode + 'Element'];
          break;
        case 'time':
        case 'date':
        case 'datetime':
          TypedElement = Forms._models.DateElement;
          View = Forms._views.DateElement;
          break;
        case 'hidden':
          TypedElement = Forms._models.HiddenElement;
          View = Forms._views.HiddenElement;
          break;
        case 'number':
          TypedElement = Forms._models.NumberElement;
          View = Forms._views.NumberElement;
          break;
        case 'telephone':
          TypedElement = Forms._models.TelephoneElement;
          View = Forms._views.TelephoneElement;
          break;
        case 'password':
          TypedElement = Forms._models.PasswordElement;
          View = Forms._views.PasswordElement;
          break;
        case 'email':
          TypedElement = Forms._models.EmailElement;
          View = Forms._views.EmailElement;
          break;
        case 'url':
          TypedElement = Forms._models.URLElement;
          View = Forms._views.URLElement;
          break;
        case 'text':
          TypedElement = Forms._models.TextElement;
          View = Forms._views.TextElement;
          break;
        case 'textarea':
          TypedElement = Forms._models.TextAreaElement;
          View = Forms._views.TextAreaElement;
          break;
        default:
          TypedElement = Forms._models.Element;
          View = Forms._views.Element;
      }
      el = new TypedElement(attrs);
      view = new View({model: el});
      el.attributes._view = view;
      return el;
    }
  });

  return Element;
});


define('collections/elements',['models/element'], function(Element) {
  

  var Elements = Backbone.Collection.extend({
    model: Element
  });

  return Elements;
});



define('models/form',['collections/elements'], function(Elements) {
  var Form;

  Form = Backbone.Model.extend({
    initialize: function() {
      var self = this,
          Page = BlinkForms._models.Page,
          pages;

      pages = this.attributes._pages;
      delete this.attributes._pages;

      if (pages && _.isArray(pages)) {
        // TODO: allow pages to be redeclared per-action
        pages = _.map(pages, function(p) {
          return Page.create(p, self);
        });
      } else {
        pages = [];
      }
      this.attributes.pages = pages;
    },
    destroy: function(options) {
      var attrs = this.attributes;
      if (attrs._view) {
        attrs._view.remove();
        delete attrs._view;
      }
      delete this.$form;
      attrs.pages.forEach(function(page) {
        page.destroy(options);
      });
      return Backbone.Model.prototype.destroy.call(this, options);
    },
    /**
     * get a Page, creating it if necessary
     * @param {Number} index desired Page index.
     */
    getPage: function(index) {
      var Page = window.BlinkForms._models.Page,
          pages = this.get('pages');

      // assume that by now it's okay to create vanilla Pages
      while (pages.length <= index) {
        pages.push(Page.create({}, this));
      }
      return pages[index];
    },
    /**
     * official Blink API
     */
    getElement: function(name) {
      return this.attributes.elements.get(name);
    },
    /**
     * official Blink API
     */
    data: function() {
      var dfrd = Q.defer(),
          data = {},
          promises = [];

      this.attributes.elements.forEach(function(el) {
        var type = el.attributes.type,
            val,
            dfrd;

        if (type === 'subForm') {
          dfrd = Q.defer();
          el.data().then(function(val) {
            data[el.attributes.name] = val;
            dfrd.resolve();
          });
          promises.push(dfrd.promise);
          return;
        }
        val = el.val();
        if (val || typeof val === 'number') {
          data[el.attributes.name] = val;
        }
      });
      Q.all(promises).done(function() {
        dfrd.resolve(data);
      });
      return dfrd.promise;
    }
  }, {
    // static properties
    /**
     * @param {Object} attrs attributes for this model.
     */
    create: function(attrs) {
      var Page = BlinkForms._models.Page,
          Element = BlinkForms._models.Element,
          elements,
          pages,
          elNames,
          form;

      if (!attrs || !_.isObject(attrs)) {
        return new Form();
      }

      elements = attrs._elements;
      delete attrs._elements;

      form = new Form(attrs);

      // create models from element definitions
      elements = _.map(elements, function(el) {
        // TODO: merge in !element overrides
        return Element.create(el, form);
      });
      // create collection
      elements = new Elements(elements);
      form.set('elements', elements);

      return form;
    }
  });

  return Form;
});

define('models/elements/subform',['models/form', 'models/element'], function(Form, Element) {
  

  var SubFormElement,
      Forms;

  Forms = Backbone.Collection.extend({
    model: Form
  });

  SubFormElement = Element.extend({
    initialize: function() {
      Element.prototype.initialize.call(this);
      this.attributes.forms = new Forms();
    },
    add: function() {
      // TODO: there is too much DOM stuff here to be in the model
      var attrs = this.attributes,
          name = attrs.subForm,
          forms = attrs.forms,
          $el = attrs._view.$el,
          $button = $el.children('.ui-btn');

      BlinkForms.getDefinition(name, 'add').then(function(def) {
        var form,
            view;

        form = Form.create(def);
        forms.add(form);
        view = form.attributes._view = new BlinkForms._views.SubForm({
          model: form
        });
        form.$form = view.$el; // backwards-compatibility, convenience
        view.render();
        $button.before(view.$el);
        view.$el.trigger('create');
      });
    },
    /**
     * @param {Number|DOMNode|jQuery} index or DOM element for the record.
     */
    remove: function(index) {
      var $form;
      // TODO: skip placeholder "delete" records when counting
      // TODO: create placeholder records on "edit"
      if (typeof index === 'number') {
        this.attributes.forms.at(index).destroy();
        return;
      }
      $form = index instanceof $ ? index : $(index);
      BlinkForms.getForm($form).destroy();
    },
    data: function() {
      var dfrd = Q.defer(),
          promises;

      promises = this.attributes.forms.map(function(form) {
        return form.data();
      });
      Q.all(promises).spread(function() {
        dfrd.resolve(_.toArray(arguments));
      }).fail(dfrd.reject);

      return dfrd.promise;
    }
  });

  return SubFormElement;
});



define('models/section',['collections/elements', 'models/element'],
      function(Elements, Element) {
  var Section;

  Section = Element.extend({
    initialize: function() {
      var Forms = BlinkForms,
          attrs = this.attributes,
          form = attrs.form;

      attrs.elements = new Elements();
      attrs._view = new Forms._views.Section({model: this});
    },
    destroy: function(options) {
      var attrs = this.attributes;
      if (attrs._view) {
        attrs._view.remove();
        delete attrs._view;
      }
      delete attrs.form;
      attrs.elements.forEach(function(element) {
        element.destroy(options);
      });
      return Backbone.Model.prototype.destroy.call(this, options);
    },
    add: function(element) {
      this.attributes.elements.add(element);
    }
  }, {
    // static properties
    /**
     * @param {Object} attrs attributes for this model.
     */
    create: function(attrs, form) {
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
define('models/page',['collections/elements', 'models/section'],
      function(Elements, Section) {
  var Page,
      Sections;

  Sections = Backbone.Collection.extend({
    model: Section
  });

  Page = Backbone.Model.extend({
    defaults: {
    },
    initialize: function() {
      var Forms = BlinkForms,
          attrs = this.attributes,
          form = attrs.form,
          action = form.attributes.action,
          elements,
          sections;

      // TODO: document that this now assumes all Sections are pre-declared

      elements = attrs.elements = new Elements();
      attrs._view = new Forms._views.Page({model: this});

      sections = form.attributes._sections;

      if (sections && _.isArray(sections)) {
        sections = _.map(sections, function(s) {
          return Section.create(s, form);
        });
        sections = new Sections(sections);
      } else {
        sections = new Sections();
      }
      sections.forEach(function(section) {
        var attrs = section.attributes,
            parent;

        if (attrs.section) {
          parent = sections.get(attrs.section);
          if (parent) {
            attrs.section = parent;
            parent.add(section);
          }
        }
        if (! attrs.section instanceof Section) {
          delete attrs.section;
        }
      });
      attrs.sections = sections;
    },
    destroy: function(options) {
      var attrs = this.attributes;
      if (attrs._view) {
        attrs._view.remove();
        delete attrs._view;
      }
      delete attrs.form;
      delete attrs.section;
      attrs.elements.forEach(function(element) {
        element.destroy(options);
      });
      return Backbone.Model.prototype.destroy.call(this, options);
    },
    add: function(element) {
      if (element instanceof Section) {
        this.attributes.sections.add(element);
      }
      if (element.attributes.section) {
        this.add(element.attributes.section);
      } else {
        this.attributes.elements.add(element);
      }
    },
    getSection: function(name) {
      var sections = this.attributes.sections,
          section;

      section = sections.get(name);
      this.add(section);
      return section;
    }
  }, {
    // static properties
    /**
     * @param {Object} attrs attributes for this model.
     */
    create: function(attrs, form) {
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



define('models/elements/heading',['models/element'], function(Element) {
  

  var HeadingElement = Element.extend({
    initialize: function() {
      Element.prototype.initialize.call(this);
    }
  });

  return HeadingElement;
});



define('models/elements/message',['models/element'], function(Element) {
  

  var MessageElement = Element.extend({
    initialize: function() {
      Element.prototype.initialize.call(this);
    }
  });

  return MessageElement;
});



define('models/elements/date',['models/element'], function(Element) {
  

  var DateElement = Element.extend({
    initialize: function() {
      Element.prototype.initialize.call(this);
      this.on('change:_date change:_time', this.prepareValue);
      this.on('change:value', this.prepareDateTime);
      if (this.attributes.defaultValue === 'now') {
        // TODO: implement this more thoroughly
        this.set('value', (new Date()).toISOString().replace(/\.\d{3}Z$/, ''));
      }
    },
    /**
     * update value to match _date and/or _time
     */
    prepareValue: function() {
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
    prepareDateTime: function() {
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
    toDate: function() {
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
    }
  });

  return DateElement;
});




define('models/elements/hidden',['models/element'], function(Element) {
  

  var HiddenElement = Element.extend({
    initialize: function() {
      Element.prototype.initialize.call(this);
    }
  });

  return HiddenElement;
});




define('models/elements/number',['models/element'], function(Element) {
  

  var NumberElement = Element.extend({
    initialize: function() {
      Element.prototype.initialize.call(this);
    },
    set: function(key, val, options) {
      var attr, attrs, unset, changes, silent, changing, prev, current;
      if (key === null) {
        return this;
      }
      if (_.isObject(key)) {
        attrs = key;
        options = val;
      } else {
        (attrs = {})[key] = val;
      }
      options = options || {};

      // tamper with 'value' if present
      if (attrs.value !== 'undefined' && attrs.value !== null) {
        // TODO: round to 'step' if present with 'min' and/or 'max'
        attrs.value = Number(attrs.value);
      }

      return Element.prototype.set.call(this, attrs, options);
    },

    validators:{
      minValue: function(value,minValue){
         return value < minValue;   
      },
      maxValue: function(value,maxValue){
          return value > maxValue;
      },
      maxDecimalPlaces: function(value,maxDecimalPlaces){
           return (new RegExp('^(?:\\d*\\.\\d{1,'+maxDecimalPlaces+'}|\\d+)$')).test(value);
       }
    },
    validate: function(attrs) {
      var errors = {};
      if (attrs === undefined) {
        attrs = this.attributes;
      }
      if (attrs.value) {
        if (this.validators.maxValue(attrs.value, attrs.max)) {
          errors.value = errors.value || [];
          errors.value.push({code: "max value error"});
        }
        if (this.validators.minValue(attrs.value, attrs.min)) {
          errors.value = errors.value || [];
          errors.value.push({code: "min value error"});
        }
        if (!this.validators.maxDecimalPlaces(attrs.value, attrs.maxDecimalPlaces)) {
          errors.value = errors.value || [];
          errors.value.push({code: "maxinum decimal places error"});
        }
      }
      if (!_.isEmpty(errors)) {
        return errors;
      }
    }
  });

  return NumberElement;
});



define('models/elements/telephone',['models/element'], function(Element) {
  

  var TelephoneElement = Element.extend({
    initialize: function() {
      Element.prototype.initialize.call(this);
    }
  });

  return TelephoneElement;
});



define('models/elements/text',['models/element'], function(Element) {
  

  var TextElement = Element.extend({
    initialize: function() {
      Element.prototype.initialize.call(this);
    }
  });

  return TextElement;
});



define('models/elements/password',['models/elements/text'], function(TextElement) {
  

  var PasswordElement = TextElement.extend({
    initialize: function() {
      TextElement.prototype.initialize.call(this);
    }
  });

  return PasswordElement;
});




define('models/elements/email',['models/elements/text'], function(TextElement) {
  

  var EmailElement = TextElement.extend({
    initialize: function() {
      TextElement.prototype.initialize.call(this);
    }
  });

  return EmailElement;
});




define('models/elements/url',['models/elements/text'], function(TextElement) {
  

  var URLElement = TextElement.extend({
    initialize: function() {
      TextElement.prototype.initialize.call(this);
    }
  });

  return URLElement;
});




define('models/elements/textarea',['models/elements/text'], function(TextElement) {
  

  var TextAreaElement = TextElement.extend({
    initialize: function() {
      TextElement.prototype.initialize.call(this);
    }
  });

  return TextAreaElement;
});




define('models/elements/boolean',['models/element'], function(Element) {
  

  var BooleanElement = Element.extend({
    initialize: function() {
      Element.prototype.initialize.call(this);
    }
  });

  return BooleanElement;
});



define('models/elements/select',['models/element'], function(Element) {
  

  var SelectElement = Element.extend({
    initialize: function() {
      Element.prototype.initialize.call(this);
    }
  });

  return SelectElement;
});



define('models/elements/multi',['models/elements/select'], function(SelectElement) {
  

  var MultiElement = SelectElement.extend({
    initialize: function() {
      SelectElement.prototype.initialize.call(this);
    }
  });

  return MultiElement;
});





define('main',['require','models/form','models/elements/subform','models/page','models/section','models/element','models/elements/heading','models/elements/message','models/elements/date','models/elements/hidden','models/elements/number','models/elements/telephone','models/elements/password','models/elements/email','models/elements/url','models/elements/text','models/elements/textarea','models/elements/boolean','models/elements/select','models/elements/multi'],function(require) {
  
  var Forms = BlinkForms;

  _.extend(Forms, Backbone.Events);

  Forms._models = {
    Form: require('models/form'),
    SubFormElement: require('models/elements/subform'),
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
    MultiElement: require('models/elements/multi')
  };

  /**
   * @param {Object} def definition of form to initialise.
   */
  Forms.initialize = function(def) {
    var form,
        view;

    if (!$.isPlainObject(def)) {
      throw new Error('unexpected Form definition structure');
    }
    form = Forms._models.Form.create(def);
    Forms.currentFormObject = form;
    view = form.attributes._view = new Forms._views.Form({model: form});
    form.$form = view.$el; // backwards-compatibility, convenience
    view.render();
  };

  return Forms;
});




define('views/jqm/form',[], function() {
  var FormView = Backbone.View.extend({
    tagName: 'form',
    attributes: {
      'novalidate': 'novalidate'
    },
    remove: function() {
      this.$el.removeData('model');
      return Backbone.View.prototype.remove.call(this);
    },
    render: function() {
      var self = this,
          pages = this.model.attributes.pages;

      this.$el.empty();
      this.$el.attr('data-form', this.model.attributes.name);
      this.$el.data('model', this.model);
      _.forEach(pages, function(page) {
        var view = page.attributes._view;

        view.render();
        self.$el.append(view.el);
      });

    }
  });

  return FormView;
});

define('views/jqm/subform',['views/jqm/form'], function(FormView) {
  var Forms = BlinkForms,
      SubFormView;

  SubFormView = FormView.extend({
    tagName: 'section',
    attributes: {},
    remove: function() {
      this.$el.children('.ui-btn').children('button').off('click');
      return FormView.prototype.remove.call(this);
    },
    render: function() {
      var $button = $('<button></button>').attr({
            type: 'button',
            'data-icon': 'minus',
            'data-action': 'remove'
          }).text(this.model.attributes.name);

      $button.on('click', this.onRemoveClick);

      FormView.prototype.render.call(this);

      this.$el.prepend($button);
    },
    onRemoveClick: function() {
      var $form = Forms.getForm(this).$form;
      Forms.getElement($form).remove($form);
    }
  });

  return SubFormView;
});

define('views/jqm/element',[], function() {
  var ElementView = Backbone.View.extend({
    tagName: 'div',
    attributes: {
      'data-role': 'fieldcontain',
      'data-rv-class': 'm.class'
    },
    initialize: function() {
      var element = this.model;
      this.$el.attr('data-name', element.attributes.name);
      this.$el.data('model', element);
      this.bindRivets();
    },
    remove: function() {
      this.$el.removeData('model');
      this.model.off(null, null, this);
      if (this.rivet) {
        this.rivet.unbind();
      }
      return Backbone.View.prototype.remove.call(this);
    },
    renderLabel: function() {
      var $label = $(document.createElement('label'));
      $label.attr({
        'data-rv-text': 'm.label',
        class: 'ui-input-text'
      });
      this.$el.append($label);
    },
    render: function() {
      var $input,
          type = this.model.get('type'),
          name = this.model.get('name');

      this.$el.empty();
      this.renderLabel();

      switch (type) {
        case 'file':
          $input = $('<input type="file" />');
          break;
        case 'image':
          $input = $('<input type="file" />');
          break;
      }
      $input.attr({
        name: name,
        'data-rv-value': 'm.value'
      });
      this.$el.append($input);
      this.bindRivets();
    },
    bindRivets: function() {
      if (this.rivet) {
        this.rivet.unbind();
      }
      this.rivet = rivets.bind(this.el, {m: this.model});
    }
  });

  return ElementView;
});

define('views/jqm/elements/subform',['views/jqm/element'], function(ElementView) {
  

  var SubFormElementView;

  SubFormElementView = ElementView.extend({
    tagName: 'section',
    remove: function() {
      this.$el.children('.ui-btn').children('button').off('click');
      return ElementView.prototype.remove.call(this);
    },
    render: function() {
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
    onAddClick: function() {
      var element = BlinkForms.getElement(this);
      element.add();
    }
  });

  return SubFormElementView;
});


define('views/jqm/page',[], function() {
  var PageView = Backbone.View.extend({
    tagName: 'section',
    initialize: function() {
      var attrs = this.model.attributes;
      if (attrs.class) {
        this.$el.addClass(attrs.class);
      }
    },
    render: function() {
      var self = this,
          form = this.model.attributes.form,
          index;

      this.$el.empty();
      this.model.get('elements').forEach(function(el) {
        var view = el.attributes._view,
            type = el.attributes.type;

        view.render();
        if (type === 'hidden') {
          self.$el.prepend(view.el);
        } else {
          self.$el.append(view.el);
        }
      });
    }
  });

  return PageView;
});


define('views/jqm/section',['views/jqm/page'], function(PageView) {
  var SectionView = PageView.extend({
    tagName: 'section',
    events: {
    },
    initialize: function() {
      var section = this.model;
      this.$el.attr('data-name', section.attributes.name);
      PageView.prototype.initialize.call(this);
    }
  });

  return SectionView;
});



define('views/jqm/elements/heading',['views/jqm/element'], function(ElementView) {
  

  var TextElementView = ElementView.extend({
    attributes: {
      'data-rv-text': 'm.text'
    },
    initialize: function() {
      var $el;
      if (this.model && _.isNumber(this.model.attributes.level)) {
        this.tagName = 'h' + this.model.attributes.level;
        $el = $('<' + this.tagName + '></' + this.tagName + '>');
        $el.attr(this.attributes);
        this.setElement($el[0]);
      }
      ElementView.prototype.initialize.call(this);
    },
    render: function() {
      this.bindRivets();
    }
  });

  return TextElementView;
});


define('views/jqm/elements/message',['views/jqm/element'], function(ElementView) {
  

  var MessageElementView = ElementView.extend({
    tagName: 'div',
    attributes: {
      'data-rv-html': 'm.html',
      'data-rv-class': 'm.class'
    },
    render: function() {
      this.bindRivets();
    }
  });

  return MessageElementView;
});


define('views/jqm/elements/date',['views/jqm/element'], function(ElementView) {
  

  var DateElementView = ElementView.extend({
    renderDate: function() {
      var $input = $(''),
          name = this.model.attributes.name;

      // TODO: implement pre-HTML5 fallback
      $input = $('<input type="date" />');
      $input.attr({
        name: name + '_date',
        'data-rv-value': 'm._date'
      });
      this.$el.append($input);

      return this;
    },
    renderTime: function() {
      var $input = $(''),
          name = this.model.attributes.name;

      // TODO: implement pre-HTML5 fallback
      $input = $('<input type="time" />');
      $input.attr({
        name: name + '_time',
        'data-rv-value': 'm._time'
      });
      this.$el.append($input);

      return this;
    },
    render: function() {
      var $input,
          type = this.model.get('type'),
          name = this.model.get('name');

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



define('views/jqm/elements/hidden',['views/jqm/element'], function(ElementView) {
  

  var TextElementView = ElementView.extend({
    initialize: function() {
      // have to do this to stop Backbone from trying to change the "type"
      this.setElement($('<input type="hidden" />')[0]);
      ElementView.prototype.initialize.call(this);
    },
    render: function() {
      var name = this.model.get('name');

      this.$el.attr({
        name: name,
        'data-rv-value': 'm.value'
      });
      this.bindRivets();
    }
  });

  return TextElementView;
});



define('views/jqm/elements/number',['views/jqm/element'], function(ElementView) {
  

  var NumberElementView = ElementView.extend({
    render: function() {
      var $input,
          attrs = this.model.attributes,
          name = attrs.name,
          min = attrs.min,
          max = attrs.max,
          step = attrs.step || 1;

      this.$el.empty();
      this.renderLabel();

      if (_.isNumber(min) && _.isNumber(max)) {
        $input = $('<input type="range" />');
        $input.attr({
          min: min,
          max: max,
          'data-highlight': true
        });

        $(document).one('pageinit', $.proxy(this.bindRivets, this));

      } else {
        // TODO: HTML4-fallback for buggy HTML5 browsers
        $input = $('<input type="number" />');
      }
      $input.attr({
        name: name,
        'data-rv-value': 'm.value',
        'data-rv-step': 'm.step'
      });
      this.$el.append($input);
      this.bindRivets();
   }
  });

  return NumberElementView;
});


define('views/jqm/elements/telephone',['views/jqm/element'], function(ElementView) {
  

  var TelephoneElementView = ElementView.extend({
    render: function() {
      var $input,
          name = this.model.get('name');

      this.$el.empty();
      this.renderLabel();

      $input = $('<input type="tel" />');
      $input.attr({
        name: name,
        'data-rv-value': 'm.value'
      });
      this.$el.append($input);
      this.bindRivets();
    }
  });

  return TelephoneElementView;
});


define('views/jqm/elements/text',['views/jqm/element'], function(ElementView) {
  

  var TextElementView = ElementView.extend({
    render: function() {
      var $input,
          name = this.model.get('name');

      this.$el.empty();
      this.renderLabel();

      $input = $('<input type="text" />');
      $input.attr({
        name: name,
        'data-rv-value': 'm.value'
      });
      this.$el.append($input);
      this.bindRivets();
    }
  });

  return TextElementView;
});


define('views/jqm/elements/password',['views/jqm/elements/text'], function(TextElementView) {
  

  var PasswordElementView = TextElementView.extend({
    render: function() {
      var $input,
          name = this.model.get('name');

      this.$el.empty();
      this.renderLabel();

      $input = $('<input type="password" />');
      $input.attr({
        name: name,
        'data-rv-value': 'm.value'
      });
      this.$el.append($input);
      this.bindRivets();
    }
  });

  return PasswordElementView;
});




define('views/jqm/elements/email',['views/jqm/elements/text'], function(TextElementView) {
  

  var EmailElementView = TextElementView.extend({
    render: function() {
      var $input,
          name = this.model.get('name');

      this.$el.empty();
      this.renderLabel();

      $input = $('<input type="email" />');
      $input.attr({
        name: name,
        'data-rv-value': 'm.value'
      });
      this.$el.append($input);
      this.bindRivets();
    }
  });

  return EmailElementView;
});



define('views/jqm/elements/url',['views/jqm/elements/text'], function(TextElementView) {
  

  var URLElementView = TextElementView.extend({
    render: function() {
      var $input,
          name = this.model.get('name');

      this.$el.empty();
      this.renderLabel();

      $input = $('<input type="text" />');
      $input.attr({
        name: name,
        'data-rv-value': 'm.value'
      });
      this.$el.append($input);
      this.bindRivets();
    }
  });

  return URLElementView;
});



define('views/jqm/elements/textarea',['views/jqm/elements/text'], function(TextElementView) {
  

  var TextAreaElementView = TextElementView.extend({
    render: function() {
      var $input,
          name = this.model.get('name');

      this.$el.empty();
      this.renderLabel();

      $input = $('<textarea />');
      $input.attr({
        name: name,
        'data-rv-value': 'm.value'
      });
      this.$el.append($input);
      this.bindRivets();
    }
  });

  return TextAreaElementView;
});



define('views/jqm/elements/boolean',['views/jqm/element'], function(ElementView) {
  

  var BooleanElementView = ElementView.extend({
    render: function() {
      var $input,
          type = this.model.attributes.type,
          name = this.model.attributes.name;

      this.$el.empty();
      this.renderLabel();

      $input = $('<select />');
      $input.attr({
        'data-rv-value': 'm.value',
        'data-role': 'slider'
      });

      _.forEach(this.model.attributes.options, function(label, value) {
        var $option = $('<option value="' + value + '">' + label + '</option>');
        $input.append($option);
      });

      this.$el.append($input);
      this.bindRivets();
      this.model.on('change:value', this.onValueChange, this);
    },
    onValueChange: function() {
      this.$el.children('select').slider('refresh');
    }
  });

  return BooleanElementView;
});



define('views/jqm/elements/choice',['views/jqm/element'], function(ElementView) {
  

  var ChoiceElementView = ElementView.extend({
  });

  return ChoiceElementView;
});


define('views/jqm/elements/choicecollapsed',['views/jqm/elements/choice'], function(ChoiceElementView) {
  

  var ChoiceCollapsedElementView = ChoiceElementView.extend({
    render: function() {
      var $input,
          type = this.model.attributes.type,
          name = this.model.attributes.name;

      this.$el.empty();
      this.renderLabel();

      $input = $('<select />');
      $input.attr({
        'data-rv-value': 'm.value'
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

      _.forEach(this.model.attributes.options, function(label, value) {
        var $option = $('<option value="' + value + '">' + label + '</option>');
        $input.append($option);
      });

      this.$el.append($input);
      this.bindRivets();
      this.model.on('change:value', this.onValueChange, this);
    },
    onValueChange: function() {
      this.$el.find('select').selectmenu('refresh');
    }
  });

  return ChoiceCollapsedElementView;
});



define('views/jqm/elements/choiceexpanded',['views/jqm/elements/choice'], function(ChoiceElementView) {
  

  var ChoiceExpandedElementView = ChoiceElementView.extend({
    remove: function() {
      var type = this.attributes.type;
      if (type !== 'select') {
        this.$el.find('input').off('click');
      }
      return ChoiceElementView.prototype.remove.call(this);
    },
    render: function() {
      var self = this,
          $fieldset,
          $legend,
          attrs = this.model.attributes,
          type = attrs.type,
          name = attrs.name,
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

      _.forEach(attrs.options, function(label, value) {
        var $label = $('<label>' + label + '</label>'),
            $input = $('<input type="' + iType + '" />');

        $input.attr({
          name: iName,
          'data-rv-checked': 'm.value',
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
    onMultiInputClick: function(event) {
      var view = event.data.view,
          model = event.data.model,
          $inputs = view.$el.find('input:checked'),
          val;

      val = _.map($inputs, function(input) {
        return $(input).val();
      });
      model.set('value', val);
    },
    onMultiValueChange: function(event) {
      var view = this,
          model = this.model,
          $inputs = view.$el.find('input[type=radio],input[type=checkbox]'),
          value = model.attributes.value;

      if (!_.isArray(value)) {
        value = [];
      }
      $inputs.each(function(index, input) {
        var $input = $(input);
        $input.prop('checked', _.indexOf(value, $input.val()) !== -1);
      });

      $inputs.checkboxradio('refresh');
    },
    onSelectValueChange: function(event) {
      var view = this,
          $inputs = view.$el.find('input[type=radio],input[type=checkbox]');

      $inputs.checkboxradio('refresh');
    }
  });

  return ChoiceExpandedElementView;
});



define('views/jqm',['require','views/jqm/form','views/jqm/subform','views/jqm/elements/subform','views/jqm/page','views/jqm/section','views/jqm/element','views/jqm/elements/heading','views/jqm/elements/message','views/jqm/elements/date','views/jqm/elements/hidden','views/jqm/elements/number','views/jqm/elements/telephone','views/jqm/elements/password','views/jqm/elements/email','views/jqm/elements/url','views/jqm/elements/text','views/jqm/elements/textarea','views/jqm/elements/boolean','views/jqm/elements/choicecollapsed','views/jqm/elements/choiceexpanded'],function(require) {
  var Forms = BlinkForms;

  $.mobile.page.prototype.options.keepNative = '[type^=time], [type^=date]';

  rivets.configure({
    prefix: 'rv',
    adapter: {
      subscribe: function(obj, keypath, callback) {
        obj.on('change:' + keypath, callback);
      },
      unsubscribe: function(obj, keypath, callback) {
        obj.off('change:' + keypath, callback);
      },
      read: function(obj, keypath) {
        return obj.get(keypath);
      },
      publish: function(obj, keypath, value) {
        obj.set(keypath, value);
      }
    }
  });

  /**
   * @param {DOMNode|jQuery} element where to start looking.
   */
  Forms.getForm = function(element) {
    var cfo = Forms.currentFormObject,
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
      return Forms.currentFormObject;
    }
    return null;
  };

  /**
   * @param {DOMNode|jQuery} element where to start looking.
   */
  Forms.getElement = function(element) {
    var cfo = Forms.currentFormObject,
        $element = element instanceof $ ? element : $(element),
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
    ChoiceExpandedElement: require('views/jqm/elements/choiceexpanded')
  };
});


  require(['main', 'views/jqm'], function(BlinkForms, Views) {
    BlinkForms._views = Views;
  });

  return BlinkForms;
}));

