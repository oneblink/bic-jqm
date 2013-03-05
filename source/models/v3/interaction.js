define(
  ['data/data', 'jquery', 'underscore', 'jquerymobile'],
  function (Backbone, $, _) {
    "use strict";
    var Interaction = Backbone.Model.extend({

      defaults: {
        header: null,
        content: null,
        footer: null,
        name: null
      },

      inherit: function () {
        if (this.has("parent")) {
          var app = require('models/v3/application'),
            parent;
          if (this.get("parent") !== "app") {
            // Not the answerSpace config, so go deeper
            parent = app.interactions.get(this.get("parent"));
            parent.inherit();
          } else {
            parent = app;
          }
          _.each(parent.attributes, function (value, key, list) {
            if (!this.has(key)) {
              this.set(key, parent.get(key));
            }
          }, this);
        }
        return this;
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
          value;
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
        app = require('models/v3/application');
        xmlString = app.datasuitcases.where({name: this.get("xml")})[0].get("data");
        xslString = xsl;
        if (typeof xmlString !== 'string' || typeof xslString !== 'string') {
          this.set("content", 'XSLT failed due to poorly formed XML or XSL.');
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
          this.set("content", html);
        }
      }
    });

    return Interaction;
  }
);
