define(
    ['data/data', 'jquery', 'jquerymobile'],
    function(Backbone, $){
        var Interaction = Backbone.Model.extend({

            defaults: {
                header: null,
                content: null,
                footer: null,
                name: null
            },

            inherit: function(){
                if (this.has("parent")){
                    var app = require('models/v3/application');
                    var parent;
                    if (this.get("parent") !== "app"){
                        // Not the answerSpace config, so go deeper
                        parent = app.interactions.get(this.get("parent"));
                        parent.inherit();
                    } else {
                        parent = app;
                    }
                    for (var attribute in parent.attributes){
                        if (!this.has(attribute)){
                            this.set(attribute, parent.get(attribute));
                        }
                    }
                }
                return this;
            },

            performXSLT: function() {
                var model = this;
                var deferred = new $.Deferred();
                deferred.then(function(model){
                    app = require('models/v3/application');
                    var xmlString = app.datasuitcases.where({name: model.get("xml")})[0].get("data");;
                    var xslString = model.get("xsl");
                    var html, xml, xsl, processor, transformer;
                    if (typeof xmlString !== 'string' || typeof xslString !== 'string') {
                        dfrd.reject('XSLT failed due to poorly formed XML or XSL.');
                        return
                    }
                    xml = $.parseXML(xmlString);
                    xsl = $.parseXML(xslString);
                    if (window.XSLTProcessor) {
                        console.log("XSLTProcessor (W3C)");
                        processor = new window.XSLTProcessor();
                        processor.importStylesheet(xsl);
                        html = processor.transformToFragment(xml, document);
                    } else if (typeof xml.transformNode !== 'undefined') {
                        console.log("transformNode (IE)");
                        html = xml.transformNode(xsl);
                    } else if (window.xsltProcess) {
                        console.log("AJAXSLT");
                        html = window.xsltProcess(xml, xsl);
                    } else {
                        console.log("XSLT: Not supported");
                        html = '<p>Your browser does not support Data Suitcase keywords.</p>';
                    }
                    dfrd.resolve(html, model);
                }, null);
                deferred.done(function(html, model){
                    model.set("content", html);
                });
            }
            

        });

        return Interaction;
    });
