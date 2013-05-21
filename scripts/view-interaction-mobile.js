define(
  ['jquery', 'wrapper-backbone', 'mustache', 'text!template-interaction.mustache', 'text!template-inputPrompt.mustache', 'text!template-form.mustache', 'model-application-mobile', 'underscore', 'BlinkForms', 'jquerymobile'],
  function ($, Backbone, Mustache, Template, inputPromptTemplate, formTemplate, app, _, BlinkForms) {
    "use strict";
    var InteractionView = Backbone.View.extend({

      initialize: function () {
        $('body').append(this.$el);

        // this.$el.once("pageremove", function () {
        //   console.log("Backbone view cleanup");

        // })
      },

      events: {
        // Old Blink Link Shortcut Methods
        "click [keyword]" : "blinklink",
        "click [interaction]" : "blinklink",
        "click [category]" : "blinklink",
        "click [masterCategory]" : "blinklink",
        "click [back]" : "back",
        "click [home]" : "blinklink",
        "click [login]" : "blinklink",

        // Form Actions
        "click #FormControls #submit" : "formSubmit",
        "click #FormControls #cancel" : "formCancel",
        "click #FormControls #save" : "formSave",
        "click #queue" : "pendingQueue",

        // Destroy
        "pageremove" : "destroy"
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
        } else if ($element.attr("home") === "") {
          location = app.get("siteName");
        } else if ($element.attr("login") === "") {
          if (app.has("loginAccess") && app.has("loginUseInteractions") && app.has("loginUseInteractions") && app.has("loginPromptInteraction")) {
            location = app.get("loginPromptInteraction");
          } else {
            location = app.get("siteName");
          }
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

        if (path.slice(-1) === "/") {
          path = path.slice(0, path.length - 1);
        }

        $.mobile.changePage(path + '/' + location + attributes);
      },

      back: function (e) {
        e.preventDefault();
        history.back();
      },

      render: function (data) {
        var form,
          rawform,
          inheritedAttributes = this.model.inherit({}),
          formobject,
          formmodel,
          view = this;

        // Non-type specific
        if (_.has(inheritedAttributes, "themeSwatch")) {
          this.$el.attr("data-theme", inheritedAttributes.themeSwatch);
        }

        // Input Prompt
        if (this.model.has("inputPrompt") && !(this.model.has("args"))) {
          rawform = this.model.get("inputPrompt");
          if (rawform.substr(0, 6) === "<form>") {
            form = rawform;
          } else {
            form = Mustache.render(inputPromptTemplate, {inputs: rawform});
          }
          this.$el.html(Mustache.render(Template, {
            header: inheritedAttributes.header,
            footer: inheritedAttributes.footer,
            content: form
          }));
          this.trigger("render");
        } else if (this.model.has("type") && this.model.get("type") === "xslt") {
          // XSLT
          this.model.once("change:content", function () {
            if (typeof (view.model.get("content")) === 'object') {
              view.$el.html(Mustache.render(Template, {
                header: inheritedAttributes.header,
                footer: inheritedAttributes.footer,
                content: ''
              }));
              view.$el.children('[data-role=content]')[0].appendChild(view.model.get("content"));
              view.processStars();
              view.trigger("render");
            }
          });
          this.model.performXSLT();
        } else if (this.model.has("type") && this.model.get("type") === "form") {
          // Form
          this.$el.html(Mustache.render(Template, {
            header: inheritedAttributes.header,
            footer: inheritedAttributes.footer,
            content: formTemplate
          }));

          BlinkForms.getDefinition(this.model.get("blinkFormObjectName"), this.model.get("blinkFormAction")).then(function (definition) {
            BlinkForms.initialize(definition);
            $('#FormContainer').append(BlinkForms.currentFormObject.$form);
            $('#FormContainer').trigger('create');
          });

          this.trigger("render");
        } else if (this.model.id.toLowerCase() === window.BMP.siteVars.answerSpace.toLowerCase()) {
          require(['text!template-category-list.mustache'], function (categoryTemplate) {
            view.$el.html(Mustache.render(Template, {
              header: inheritedAttributes.header,
              footer: inheritedAttributes.footer,
              content: Mustache.render(categoryTemplate, {
                models: _.map(_.filter(app.interactions.models, function (value, key, list) {
                  return value.id !== window.BMP.siteVars.answerSpace && (value.has("tags") && value.get("tags").length === 0 && value.get("display") !== "hide" || _.filter(value.get("tags"), function (element, index, list) {
                    return element === 'nav-' + window.BMP.siteVars.answerSpace.toLowerCase();
                  }, this).length > 0);
                }, this), function (value, key, list) {
                  return value.attributes;
                }),
                path: data.dataUrl
              })
            }));
            view.trigger("render");
          });
        } else if (!this.model.has("type")) {
          // Category
          require(['text!template-category-list.mustache'], function (categoryTemplate) {
            view.$el.html(Mustache.render(Template, {
              header: inheritedAttributes.header,
              footer: inheritedAttributes.footer,
              content: Mustache.render(categoryTemplate, {
                models: _.map(_.filter(app.interactions.models, function (value, key, list) {
                  return value.get("display") !== "hide" && _.filter(value.get("tags"), function (element, index, list) {
                    return element === 'nav-' + this.model.id.toLowerCase();
                  }, this).length > 0;
                }, view), function (value, key, list) {
                  return value.attributes;
                }),
                path: data.dataUrl
              })
            }));
            view.trigger("render");
          });
        } else if (this.model.get("type") === "message") {
          this.$el.html(Mustache.render(Template, {
            header: inheritedAttributes.header,
            footer: inheritedAttributes.footer,
            content: inheritedAttributes.message
          }));
          this.trigger("render");
        } else {
          this.$el.html(Mustache.render(Template, inheritedAttributes));
          if (this.model.has("content")) {
            this.blinkAnswerMessages();
            this.maps();
            this.processStars();
          }
          this.trigger("render");
        }
        return this;
      },

      maps: function () {
        var mapdiv = this.$el.find("[class=googlemap]");
        if (mapdiv.length !== 0) {
          this.$el.append('<style type="text/css">.googlemap { width: 100%; height: 360px; }</style>');
          this.$el.append('<script src="/_BICv3_/js/gMaps.js"></script>');
        }
      },

      blinkAnswerMessages: function (message) {
        if (!message) {
          // First Pass - Extract content
          var blinkAnswerMessage = this.model.get('content').match(/<!-- blinkAnswerMessage:\{.*\} -->/g);

          if ($.type(blinkAnswerMessage) === 'array') {
            _.each(blinkAnswerMessage, function (element, index, list) {
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
              console.log(message);
            }
            if ($.type(message.staroff) === 'array') {
              // Remove specific stars
              console.log(message);
            }
            if ($.type(message.staron) === 'array') {
              // Add stars
              console.log(message);
            }
          }
        }
      },

      formSubmit: function () {
        // Put in pending queue for processing
        var view = this;
        BlinkForms.currentFormObject.data().then(function (data) {
          app.pending.create({
            type: "Form",
            status: "Pending",
            name: view.model.get("blinkFormObjectName"),
            action: view.model.get("blinkFormAction"),
            answerspaceid: app.get("dbid"),
            data: data//JSON.stringify(data)
          });
          app.pending.processQueue();
        });
      },

      formCancel: function () {
        // If in pending queue, remove
        // Close the form
        $('#cancelPopup').popup('open');
      },

      formSave: function () {
        // Save to pending queue as a draft
        var view = this;
        BlinkForms.currentFormObject.data().then(function (data) {
          app.pending.create({
            type: "Form",
            status: "Draft",
            name: view.model.get("blinkFormObjectName"),
            action: view.model.get("blinkFormAction"),
            answerspaceid: app.get("dbid"),
            data: JSON.stringify(data)
          });
          app.pending.processQueue();
        });
      },

      pendingQueue: function () {
        require(['text!template-pending-mobile.mustache'], function (Template) {
          var el = $('#pendingContent');
          el.html(Mustache.render(Template, {
            pending: _.map(app.pending.where({status: 'Pending'}), function (model) {return _.clone(model.attributes); }),
            draft: _.map(app.pending.where({status: 'Draft'}), function (model) {return _.clone(model.attributes); })
          }));
          $('#pendingPopup').popup('open');
        });
      },

      destroy: function () {
        this.remove();
      },

      processStars: function () {
        var elements = this.$el.find('.blink-starrable');
        if (elements) {
          require(['view-star-mobile', 'model-star-mobile'], function (StarView, StarModel) {
            elements.each(function (index, element) {
              var view,
                attrs,
                model = app.stars.get($(element).data('id'));
              if (!model) {
                attrs = $(element).data();
                attrs._id = attrs.id.toString();
                delete attrs.id;
                attrs.state = false;
                model = new StarModel(attrs);
              }
              view = new StarView({
                model: model,
                el: element
              });
            });
          });
        }
      }

    });

    return InteractionView;
  }
);
