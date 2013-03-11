define(
  ['jquery', 'backbone', 'mustache', 'text!templates/v3/interaction.html', 'text!templates/v3/inputPrompt.html', 'models/v3/application', 'underscore', 'forms/forms', 'jquerymobile'],
  function ($, Backbone, Mustache, Template, FormTemplate, app, _, forms) {
    "use strict";
    var InteractionView = Backbone.View.extend({

      initialize: function () {
        $('body').append(this.$el);
      },

      events: {
        "click [keyword]" : "blinklink",
        "click [interaction]" : "blinklink",
        "click [category]" : "blinklink",
        "click [masterCategory]" : "blinklink",
        "click [back]" : "back",
        "click [home]" : "blinklink",
        "click [login]" : "blinklink"
      },

      attributes: {
        "data-role": "page"
      },

      blinklink: function (e) {
        e.preventDefault();

        var $element,
          location,
          attributes = "",
          first = true,
          count,
          path;

        if (e.target.tagName !== 'A') {
          $element = $(e.target).parents('a');
        } else {
          $element = $(e.target);
        }

        location = "";
        if ($element.attr("keyword")) {
          location = $element.attr("keyword");
        } else if ($element.attr("interaction")) {
          location = $element.attr("interaction");
        } else if ($element.attr("category")) {
          location = $element.attr("category");
        } else if ($element.attr("masterCategory")) {
          location = $element.attr("masterCategory");
        } else if ($element.attr("home")) {
          location = this.get("siteName");
        } else if ($element.attr("login")) {
          location = this.get("siteName");
        }

        for (count = 0; count < $element[0].attributes.length; count = count + 1) {
          if ($element[0].attributes[count].name.substr(0, 1) === "_") {
            if (!first) {
              attributes += "&args[" + $element[0].attributes[count].name + "]=" + $element[0].attributes[count].value;
            } else {
              first = false;
              attributes = "/?args[" + $element[0].attributes[count].name.substr(1) + "]=" + $element[0].attributes[count].value;
            }
          }
        }

        path = $.mobile.path.parseLocation().pathname;
        if ($.mobile.path.parseLocation().search) {
          path = $.mobile.path.parseLocation().pathname.substr(0, $.mobile.path.parseLocation().pathname.length - 1);
        }

        $.mobile.changePage(path + '/' + location + attributes);
      },

      back: function (e) {
        e.preventDefault();
        history.back();
      },

      render: function () {
        var form,
          rawform,
          inheritedAttributes = this.model.inherit({}),
          BlinkForms;

        // Input Prompt
        if (this.model.has("inputPrompt") && !(this.model.has("args"))) {
          rawform = this.model.get("inputPrompt");
          if (rawform.substr(0, 6) === "<form>") {
            form = rawform;
          } else {
            form = Mustache.render(FormTemplate, {inputs: rawform});
          }
          this.$el.html(Mustache.render(Template, {
            header: inheritedAttributes.header,
            footer: inheritedAttributes.footer,
            content: form
          }));
        } else if (this.model.has("type") && this.model.get("type") === "xslt") {
          // XSLT
          this.model.performXSLT();
          if (typeof (this.model.get("content")) === 'object') {
            this.$el.html(Mustache.render(Template, {
              header: inheritedAttributes.header,
              footer: inheritedAttributes.footer,
              content: ''
            }));
            this.$el.children('[data-role=content]')[0].appendChild(this.model.get("content"));
          }
        } else if (this.model.has("type") && this.model.get("type") === "form") {
          // Form
          var formobject = forms.getForm();
          console.log(formobject);
          this.$el.html(Mustache.render(Template, {
            header: inheritedAttributes.header,
            footer: inheritedAttributes.footer,
            content: '<div id="BlinkForm"></div>'
          }));
          $('#BlinkForm').append(formobject.$form);
        } else {
          if (_.has(inheritedAttributes, "themeSwatch")) {
            this.$el.attr("data-theme", inheritedAttributes.themeSwatch);
          }
          this.$el.html(Mustache.render(Template, inheritedAttributes));
          this.maps();
        }
        return this;
      },

      maps: function () {
        var mapdiv = this.$el.find("[class=googlemap]");
        if (mapdiv.length !== 0) {
          this.$el.append('<style type="text/css">.googlemap { width: 100%; height: 360px; }</style>');
          this.$el.append('<script src="/_BICv3_/js/gMaps.js"></script>');
        }
      }

    });

    return InteractionView;
  }
);
