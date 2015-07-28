define(function (require) {
  'use strict';

  // foreign modules

  var $ = require('jquery');
  var _ = require('underscore');
  var Backbone = require('backbone');
  var Promise = require('feature!promises');

  // local modules

  var facade = require('bic/facade');
  var API = require('bic/api');

  // this module

  var Interaction;
  var makeArgId;
  var extractArgProp;
  var convertQueryStringArrays;

  // helper for flattening the processed query string
  convertQueryStringArrays = function (args, key){
    var values = _.chain(args)
                  .flatten()
                  .uniq()
                  .tail()
                  .map(decodeURIComponent)
                  .value();

    // normalize the keys if they are in name[] format and set
    return [key.replace(/\[\]/g, ''), values.length > 1 ? values : values[0] ];
  };

  // ensures that the passed in property name is in the form 'args[argName]'
  makeArgId = function (argName){
    if ( !/^args\[.+\]$/.test(argName) ){
      argName = 'args[' + argName + ']';
    }

    return argName;
  };

  // gets the property name out of a name run through makeArgId
  extractArgProp = function (keyName){
    var match = keyName.match(/^args\[(.+)\]$/);

    return match ? match[1] : keyName;
  };

// end private

/**
A model of an interaction
@class Backbone.Model InteractionModel
*/
  Interaction = Backbone.Model.extend({

    idAttribute: '_id',

    defaults: {
      header: null,
      content: null,
      contentTime: null,
      footer: null,
      name: null
    },

    inherit: function (config) {
      var app = window.BMP.BIC;
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

/**
sets the values of the attributes.args hash based on the passed in query string
if the key appears more than once in the string its parameters are aggregated
into an array.

@example
setArgsFromQueryString('?args[pid]=23&args[id]=1&arr=1&arr=2&arr=3')
// -or-
setArgsFromQueryString('?args[pid]=23&args[id]=1&args[arr]=1&args[arr]=2&args[arr]=3')
//  model.attributes.args =
//  {
//    args[pid]: 23,
//    args[id]: 1,
//    args[arr]: [1, 2, 3]
//  }
@param {string} arguments in query string format, eg key=value&key2=value2
*/
    setArgsFromQueryString: function (queryString){
      var args;
      args = _.chain((queryString[0] === '?' ? queryString.substr(1) : queryString).split('&'))
              .compact()
              .map(function (qsParam){ return qsParam.split('='); })
              .groupBy(function (arg){ return arg[0]; })
              .map(convertQueryStringArrays)
              .value();

      if (!args.length){
        this.set('args', null);
        return;
      }

      _.each(args, function (arg){ this.setArgument.apply(this, arg); }, this );
    },

/**
Gets an argument from attributes.args

@param {string} argName - The argument name, with or without the 'args[]' wrapping.

@returns {*} - The value of the argument or **null** if not found
*/
    getArgument: function (argName){
      var args = this.get('args');
      argName = makeArgId(argName);

      return args ? args[argName] : null;
    },

/**
Sets an argument to attributes.args. Ensures that it conforms to the format the BMP expects.

@emits Interaction#change:args

@param {string} argName - The name of the argument, with or without the 'args[]' wrapping.
@param {*} value - The value of the argument
*/
    setArgument: function (argName, value){
      var args = {};

      if ( !this.get('args')){
        this.set('args', args, {silent: true});
      } else {
        args = this.get('args');
      }

      argName = makeArgId(argName);

      args[ argName ] = value;

/**
The argument change event.

@event Interaction#change:args

@type {object}
@property {string} name - The name of the argument that was changed, without the args[] wrapping
@property {string} value - The value of the argument that was changed
*/
      this.trigger('change:args', {name: extractArgProp(argName), value: value});
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

    defaultView: function (models) {
      var model = this;
      model.set({interactionList: _.map(_.filter(models, function (value) {
        return value.id !== window.BMP.BIC.siteVars.answerSpace.toLowerCase() && value.get('display') !== 'hide' && (!value.has('tags') || value.has('tags') && value.get('tags').length === 0 || _.filter(value.get('tags'), function (element) {
          return element === 'nav-' + window.BMP.BIC.siteVars.answerSpace.toLowerCase();
        }, this).length > 0);
      }, this), function (value) {
        return value.attributes;
      })});
    },

    prepareAnswerSpace: function (resolve, reject, data) {
      var model = this;
      require(['bic'], function (app) {
        var homeInteraction;
        var loginInteraction;
        var path;
        var url;

        if (app.has('loginAccess') && app.get('loginAccess') === true && app.has('loginPromptInteraction')) {
          API.getLoginStatus().then(function (loginData) {
            if (loginData.status !== 'LOGGED IN') {
              loginInteraction = app.interactions.findWhere({dbid: 'i' + app.get('loginPromptInteraction')});

              path = $.mobile.path.parseLocation().pathname;
              if (path.slice(-1) === '/') {
                path = path.slice(0, path.length - 1);
              }

              url = path;
              if (_.indexOf(path.split('/'), loginInteraction.id) < 0) {
                url = url + '/' + loginInteraction.id;
              }
              $.mobile.changePage(url);

              resolve(model);
            } else {
              model.defaultView(app.interactions.models);
              resolve(model);
            }
          });
        } else if (app.has('homeScreen') && app.get('homeScreen') !== false && app.has('homeInteraction')) {
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
          model.defaultView(app.interactions.models);
          resolve(model);
        }
      });
    },

    prepareMADL: function (resolve, reject, data) {
      var model = this;
      require(['bic'], function (app) {
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
                      if (app.get('loginToDefaultScreen')) {
                        app.goToInteraction();
                      } else {
                        app.goToInteraction(data.dataUrl);
                      }
                    } else if (model.get('args') && !model.get('args').logout) {
                      // Logged Out
                      model.save({
                        'content-anonymous': result
                      });
                      app.goToInteraction();
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
      require(['bic'], function (app) {
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
        require(['bic'], function (app) {
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
      require(['bic'], function (app) {
        xmlString = model.get('starXml') || app.datasuitcases.get(model.get('xml')).get('data');
        xslString = xsl;
        if (typeof xmlString !== 'string' || typeof xslString !== 'string') {
          model.set('content', 'XSLT failed due to poorly formed XML or XSL.');
          return;
        }
        xml = $.parseXML(xmlString);
        xsl = $.parseXML(xslString);
        if (window.XSLTProcessor) {
          // console.log('XSLTProcessor (W3C)');
          processor = new window.XSLTProcessor();
          processor.importStylesheet(xsl);
          html = processor.transformToFragment(xml, document);
        } else if (xml.transformNode !== undefined) {
          // console.log('transformNode (IE)');
          html = xml.transformNode(xsl);
        } else if (window.xsltProcess) {
          // console.log('AJAXSLT');
          html = window.xsltProcess(xml, xsl);
        } else {
          // console.log('XSLT: Not supported');
          html = '<p>Your browser does not support Data Suitcase keywords.</p>';
        }
        if (html) {
          model.set('content', html);
        }
      });
    }
  });

  return Interaction;
});
