define(
  ['api'],
  function (API) {
    "use strict";
    var Interaction = Backbone.Model.extend({

      idAttribute: "_id",

      defaults: {
        header: null,
        content: null,
        contentTime: null,
        footer: null,
        name: null
      },

      inherit: function (config) {
        if (this.has("parent")) {
          var app = require('model-application'),
            parent;

          _.each(this.attributes, function (value, key) {
            if (!_.has(config, key) || !config[key]) {
              config[key] = value;
            }
          }, this);

          if (this.get("parent") !== "app") {
            // Not the answerSpace config, so go deeper
            parent = app.interactions.get(this.get("parent"));
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

        if (this.has("args")) {
          args = this.get("args");
          xsl = this.get("xsl");
          placeholders = xsl.match(/\$args\[[\w\:][\w\:\-\.]*\]/g);
          pLength = placeholders ? placeholders.length : 0;
          for (p = 0; p < pLength; p = p + 1) {
            value = typeof args[placeholders[p].substring(1)] === 'string' ? args[placeholders[p].substring(1)] : '';
            value = value.replace('"', '');
            value = value.replace("'", '');
            value = decodeURIComponent(value);
            xsl = xsl.replace(placeholders[p], value);
          }
        } else {
          xsl = this.get("xsl");
        }

        starType = xsl.match(/blink-stars\(([@\w.]+),\W*(\w+)\W*\)/);
        if (starType) {
          require(['model-application'], function (app) {
            var constructCondition;

            constructCondition = function (starType) {
              condition = '';
              variable = starType[1];
              starType = starType[2];
              _.each(app.stars.where({type: starType}), function (value) {
                condition += ' or ' + variable + '=\'' + value.get("_id") + '\'';
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
          xmlString = model.get("starXml") || app.datasuitcases.get(model.get("xml")).get("data");
          xslString = xsl;
          if (typeof xmlString !== 'string' || typeof xslString !== 'string') {
            model.set("content", 'XSLT failed due to poorly formed XML or XSL.');
            return;
          }
          xml = $.parseXML(xmlString);
          xsl = $.parseXML(xslString);
          if (window.XSLTProcessor) {
            //console.log("XSLTProcessor (W3C)");
            processor = new window.XSLTProcessor();
            processor.importStylesheet(xsl);
            html = processor.transformToFragment(xml, document);
          } else if (xml.transformNode !== undefined) {
            //console.log("transformNode (IE)");
            html = xml.transformNode(xsl);
          } else if (window.xsltProcess) {
            //console.log("AJAXSLT");
            html = window.xsltProcess(xml, xsl);
          } else {
            //console.log("XSLT: Not supported");
            html = '<p>Your browser does not support Data Suitcase keywords.</p>';
          }
          if (html) {
            model.set("content", html);
          }
        });
      },

      prepareForView: function (data) {
        // Handle MADL updates here
        // Check for other updates needed here?
        var dfrd = new $.Deferred(),
          model = this,
          homeInteraction,
          loginInteraction,
          xml = '',
          attrs,
          path;

        if (model.id === window.BMP.BIC.siteVars.answerSpace) {
          require(['model-application'], function (app) {
            if (app.has("homeScreen") && app.get("homeScreen") !== false && app.has("homeInteraction")) {
              homeInteraction = app.interactions.findWhere({dbid: "i" + app.get("homeInteraction")});
              if (homeInteraction) {
                homeInteraction.set({parent: model.get("parent")});
                homeInteraction.prepareForView(data).done(function () {
                  dfrd.resolve(homeInteraction);
                });
              } else {
                dfrd.reject();
              }
            } else {
              model.set({interactionList: _.map(_.filter(app.interactions.models, function (value) {
                return value.id !== window.BMP.BIC.siteVars.answerSpace && value.get("display") !== "hide" && (!value.has("tags") || (value.has("tags") && value.get("tags").length === 0) || _.filter(value.get("tags"), function (element) {
                  return element === 'nav-' + window.BMP.BIC.siteVars.answerSpace.toLowerCase();
                }, this).length > 0);
              }, this), function (value) {
                return value.attributes;
              })});

              if (model.get("interactionList").length === 0 && app.has("loginAccess") && app.get("loginAccess") === true && app.has("loginPromptInteraction")) {
                loginInteraction = app.interactions.findWhere({dbid: "i" + app.get("loginPromptInteraction")});

                path = $.mobile.path.parseLocation().pathname;
                if (path.slice(-1) === "/") {
                  path = path.slice(0, path.length - 1);
                }

                dfrd.resolve(model);
                $.mobile.changePage(path + '/' + loginInteraction.id);
                //if (loginInteraction) {
                  //loginInteraction.set({parent: model.get("parent")});
                  //loginInteraction.prepareForView(data).done(function () {
                    //dfrd.resolve(loginInteraction);
                  //});
                //}
              } else {
                dfrd.resolve(model);
              }
            }
          });
        }

        if (model.get("type") === "madl code") {
          /*jslint unparam: true*/
          API.getInteractionResult(model.id, this.get('args'), data.options).then(
            function (result) {
              model.save({
                content: result,
                contentTime: Date.now()
              }, {
                success: function () {
                  dfrd.resolve(model);
                },
                error: function () {
                  dfrd.resolve(model);
                }
              });
            },
            function (jqXHR, textStatus, errorThrown) {
              dfrd.reject(errorThrown);
            }
          );
          /*jslint unparam: false*/
        }

        if (model.get("type") === "xslt" && model.get("xml").indexOf('stars:') === 0) {
          model.set({
            mojoType: "stars",
            xml: model.get("xml").replace(/^stars:/, '')
          });
        }

        if (model.get("type") === "xslt" && model.get("mojoType") === "stars") {
          require(['model-application'], function (app) {
            _.each(app.stars.where({type: model.get("xml")}), function (value) {
              xml += '<' + value.get("type") + ' id="' + value.get("_id") + '">';

              attrs = _.clone(value.attributes);
              delete attrs._id;
              delete attrs._rev;
              delete attrs.type;
              delete attrs.state;

              _.each(attrs, function (value, key) {
                xml += '<' + key + '>' + value + '</' + key + '>';
              });

              xml += '</' + value.get("type") + '>';
            });
            xml = '<stars>' + xml + '</stars>';
            model.set({
              starXml: xml
            });
            dfrd.resolve(model);
          });
        }

        if (model.get("type") !== "madl code" && model.id !== window.BMP.BIC.siteVars.answerSpace) {
          dfrd.resolve(model);
        }

        return dfrd.promise();
      },
    });

    return Interaction;
  }
);
