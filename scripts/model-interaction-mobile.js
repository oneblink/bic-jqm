define(
  ['wrapper-backbone', 'jquery', 'underscore', 'api-php', 'jquerymobile'],
  function (Backbone, $, _, API) {
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
          var app = require('model-application-mobile'),
            parent;

          _.each(this.attributes, function (value, key, list) {
            if (!_.has(config, key) || !config[key]) {
              config[key] = value;
            }
          }, this);

          if (this.get("parent") !== "app") {
            // Not the answerSpace config, so go deeper
            parent = app.interactions.get(this.get("parent"));
            parent.inherit(config);
          } else {
            _.each(app.attributes, function (value, key, list) {
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
          transformer,
          args,
          placeholders,
          pLength,
          p,
          value,
          model;
        if (this.has("args")) {
          args = this.get("args");
          placeholders = xsl.match(/\$args\[[\w\:][\w\:\-\.]*\]/g);
          pLength = placeholders ? placeholders.length : 0;
          xsl = this.get("xsl");
          for (p = 0; p < pLength; p = p + 1) {
            value = typeof args[placeholders[p].substring(1)] === 'string' ? args[placeholders[p].substring(1)] : '';
            // TODO: find a better solution upstream for having to decode this here
            value = value.replace('"', '');
            value = value.replace("'", '');
            value = decodeURIComponent(value);
            xsl = xsl.replace(placeholders[p], value);
          }
        } else {
          xsl = this.get("xsl");
        }

        model = this;
        require(['model-application-mobile'], function (app) {
          xmlString = app.datasuitcases.get(model.get("xml")).get("data");
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

      prepareView: function (data) {
        // Handle MADL updates here
        // Check for other updates needed here?
        var dfrd = new $.Deferred(),
          model = this,
          homeInteraction,
          childInteraction;

        if (model.id === window.BMP.siteVars.answerSpace) {
          require(['model-application-mobile'], function (app) {
            if (app.has("homeScreen") && app.get("homeScreen") !== false && app.has("homeInteraction")) {
              homeInteraction = app.interactions.findWhere({dbid: "i" + app.get("homeInteraction")});
              if (homeInteraction) {
                homeInteraction.set({parent: model.get("parent")});
              }

              childInteraction = app.interactions.findWhere({dbid: "a" + window.BMP.siteVars.answerSpace});
              if (childInteraction) {
                childInteraction.set({parent: model.id});
              }

              homeInteraction.prepareView().done(function () {
                dfrd.resolve(homeInteraction);
              });
            } else {
              dfrd.resolve(model);
            }
          });
        }

        if (model.get("type") === "madl code") {
          API.getInteractionResult(model.id, data.options).then(
            function (data, textStatus, jqXHR) {
              model.save({
                content: data,
                contentTime: Date.now()
              }, {
                success: function () {
                  dfrd.resolve(model);
                },
                error: function (error) {
                  dfrd.reject(error);
                }
              });
            },
            function (jqXHR, textStatus, errorThrown) {
              dfrd.reject(errorThrown);
            }
          );
        }

        if (model.get("type") !== "madl code" && model.id !== window.BMP.siteVars.answerSpace) {
          dfrd.resolve(model);
        }

        return dfrd.promise();
      }
    });

    return Interaction;
  }
);
