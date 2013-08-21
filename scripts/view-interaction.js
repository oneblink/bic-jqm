define(
  ['text!template-interaction.mustache', 'text!template-inputPrompt.mustache', 'text!template-form.mustache', 'model-application', 'text!template-category-list.mustache', 'model-star', 'text!template-pending.mustache', 'view-star'],
  function (Template, inputPromptTemplate, formTemplate, app, categoryTemplate, StarModel, pendingTemplate, StarView) {
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
        "click [home]" : "home",
        "click [login]" : "blinklink",
        "click [pending]" : "pendingQueue",

        // Form Actions
        "click #FormControls #submit" : "formSubmit",
        "click #FormControls #cancel" : "formCancel",
        "click #FormControls #save" : "formSave",
        "click #nextFormPage" : "nextFormPage",
        "click #previousFormPage" : "previousFormPage",
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
              attributes += "&args[" + $element[0].attributes[count].name.substr(1) + "]=" + $element[0].attributes[count].value;
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

      home: function () {
        $.mobile.changePage('/' + app.get("siteName"));
      },

      render: function (data) {
        var form,
          rawform,
          inheritedAttributes = this.model.inherit({}),
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
          if ($('#ActiveFormContainer').length > 0) {
            $('#ActiveFormContainer').attr('id', 'FormContainer');
          }

          // Form
          view.$el.html(Mustache.render(Template, {
            header: inheritedAttributes.header,
            footer: inheritedAttributes.footer,
            content: formTemplate
          }));

          form = $('#ActiveFormContainer');
          if (view.model.get("blinkFormAction") === "add" ||
              view.model.get("blinkFormAction") === "edit" ||
              view.model.get("blinkFormAction") === "view" ||
              view.model.get("blinkFormAction") === "delete") {
            BlinkForms.getDefinition(view.model.get("blinkFormObjectName"), view.model.get("blinkFormAction")).then(function (definition) {
              var formPageCount;

              BlinkForms.initialize(definition);
              form.append(BlinkForms.current.$form);

              if (view.model.get("blinkFormAction") === "edit") {
                BlinkForms.current.setRecord(app.pending.get(view.model.get("args")['args[id]']).get("data"));
              }

              if (BlinkForms.current.get('pages').length > 1) {
                // Multi page form. Prepare counters and stuff
                formPageCount = view.$el.find('#FormPageCount');
                formPageCount.find('#currentPage').html(BlinkForms.current.get('pages').current.index() + 1);
                formPageCount.find('#totalPages').html(BlinkForms.current.get('pages').length);
                view.formPagingButtons();
                formPageCount.removeAttr('style');
              }

              view.trigger("render");
            });
          }
        } else if (this.model.id.toLowerCase() === window.BMP.siteVars.answerSpace.toLowerCase()) {
          // Home Screen
          view.$el.html(Mustache.render(Template, {
            header: inheritedAttributes.header,
            footer: inheritedAttributes.footer,
            content: Mustache.render(categoryTemplate, {
              models: _.map(_.filter(app.interactions.models, function (value) {
                return value.id !== window.BMP.siteVars.answerSpace && value.get("display") !== "hide" && (!value.has("tags") || (value.has("tags") && value.get("tags").length === 0) || _.filter(value.get("tags"), function (element) {
                  return element === 'nav-' + window.BMP.siteVars.answerSpace.toLowerCase();
                }, this).length > 0);
              }, this), function (value) {
                return value.attributes;
              }),
              path: data.dataUrl.substr(-1) === '/' ? data.dataUrl : data.dataUrl + '/'
            })
          }));
          view.trigger("render");
        } else if (!this.model.has("type")) {
          // Category
          view.$el.html(Mustache.render(Template, {
            header: inheritedAttributes.header,
            footer: inheritedAttributes.footer,
            content: Mustache.render(categoryTemplate, {
              models: _.map(_.filter(app.interactions.models, function (value) {
                return value.get("display") !== "hide" && _.filter(value.get("tags"), function (element) {
                  return element === 'nav-' + this.model.id.toLowerCase();
                }, this).length > 0;
              }, view), function (value) {
                return value.attributes;
              }),
              path: data.dataUrl.substr(-1) === '/' ? data.dataUrl : data.dataUrl + '/'
            })
          }));
          view.trigger("render");
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

          /*jslint regexp: true */
          var blinkAnswerMessage = this.model.get('content').match(/<!-- blinkAnswerMessage:\{.*\} -->/g);
          /*jslint regexp: false */

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

      formSubmit: function () {
        this.addToQueue("Pending");
      },

      formCancel: function () {
        $('#cancelPopup').popup('open');
      },

      formSave: function () {
        this.addToQueue("Draft");
      },

      addToQueue: function (status) {
        var view = this;
        BlinkForms.current.data().then(function (data) {
          data._action = view.model.get("blinkFormAction");
          var modelAttrs = {
            type: "Form",
            status: status,
            name: view.model.get("blinkFormObjectName"),
            action: view.model.get("blinkFormAction"),
            answerspaceid: app.get("dbid"),
            data: data
          };
          if (view.model.get("blinkFormAction") === "edit") {
            app.pending.get(view.model.get("args")['args[id]']).set(modelAttrs);
          } else {
            app.pending.create(modelAttrs);
          }
          app.pending.processQueue();
          view.home();
        });
      },

      pendingQueue: function () {
        //var el = $('#pendingContent');
        var pendingExtractor = function (status) {
          return _.map(app.pending.where({status: status}), function (pendingItem) {
            var pendingAttrs = _.clone(pendingItem.attributes);
            pendingAttrs.editInteraction = app.interactions.where({
              blinkFormObjectName: pendingItem.get("name"),
              blinkFormAction: 'edit'
            })[0].id;
            return pendingAttrs;
          });
        };

        this.$el.append(Mustache.render(pendingTemplate, {
          pending: pendingExtractor("Pending"),
          draft: pendingExtractor("Draft")
        }));
        this.$el.trigger('pagecreate');
        $('#pendingPopup').popup('open');
      },

      destroy: function () {
        this.remove();
      },

      processStars: function () {
        var elements = this.$el.find('.blink-starrable');
        if (elements) {
          /*jslint unparam: true*/
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
          /*jslint unparam: false*/
        }
      },

      nextFormPage: function () {
        var index = BlinkForms.current.get('pages').current.index();

        if (index < BlinkForms.current.get('pages').length - 1) {
          BlinkForms.current.get('pages').goto(index + 1);
          $('#currentPage').html(BlinkForms.current.get('pages').current.index() + 1);
        }

        this.formPagingButtons();
      },

      previousFormPage: function () {
        var index = BlinkForms.current.get('pages').current.index();

        if (index > 0) {
          BlinkForms.current.get('pages').goto(index - 1);
          $('#currentPage').html(BlinkForms.current.get('pages').current.index() + 1);
        }

        this.formPagingButtons();
      },

      formPagingButtons: function () {
        var previous = $('#previousFormPage'),
          next = $('#nextFormPage');

        if (BlinkForms.current.get('pages').current.index() === 0) {
          previous.addClass('ui-disabled');
        } else {
          previous.removeClass('ui-disabled');
        }

        if (BlinkForms.current.get('pages').current.index() === BlinkForms.current.get('pages').length - 1) {
          next.addClass('ui-disabled', '');
        } else {
          next.removeClass('ui-disabled');
        }
      }

    });

    return InteractionView;
  }
);
