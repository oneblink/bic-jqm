define(
  ['text!template-form-controls.mustache', 'model-application'],
  function (Template, app) {
    "use strict";
    var FormControlView = Backbone.View.extend({

      events: {
        "click #FormControls #submit" : "formSubmit",
        "click #FormControls #cancel" : "formCancel",
        "click #FormControls #save" : "formSave",
        "click #nextFormPage" : "nextFormPage",
        "click #previousFormPage" : "previousFormPage"
      },

      render: function () {
        var view, options;

        view = this;
        options = {};


        if (BlinkForms.current.get('pages').length > 1) {
          options.pages = {
            current: BlinkForms.current.get('pages').current.index() + 1,
            total: BlinkForms.current.get('pages').length
          };

          if (BlinkForms.current.get('pages').current.index() !== 0) {
            options.pages.previous = true;
          }

          if (BlinkForms.current.get('pages').current.index() !== BlinkForms.current.get('pages').length - 1) {
            options.pages.next = true;
          }
        }

        view.$el.html(Mustache.render(Template, options));
        $.mobile.activePage.trigger('pagecreate');

        return view;
      },

      nextFormPage: function () {
        var view, index;

        view = this;
        index = BlinkForms.current.get('pages').current.index();

        if (index < BlinkForms.current.get('pages').length - 1) {
          BlinkForms.current.get('pages').goto(index + 1);
        }

        view.render();
      },

      previousFormPage: function () {
        var view, index;

        view = this;
        index = BlinkForms.current.get('pages').current.index();

        if (index > 0) {
          BlinkForms.current.get('pages').goto(index - 1);
        }

        view.render();
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
        var view, model;

        view = this;
        BlinkForms.current.data().then(function (data) {
          data._action = view.model.get("blinkFormAction");
          var modelAttrs = {
            type: "Form",
            status: status,
            name: view.model.get("blinkFormObjectName"),
            label: view.model.get('displayName'),
            action: view.model.get("blinkFormAction"),
            answerspaceid: app.get("dbid"),
            data: data
          };
          if (view.model.get("blinkFormAction") === "edit") {
            model = app.pending.get(view.model.get("args")['args[pid]']);
            model.set(modelAttrs);
          } else {
            model = app.pending.create(modelAttrs);
          }
          $(window).one("pagechange", function () {
            if (!navigator.onLine || model.get('status') === 'Draft') {
              app.view.pendingQueue();
            } else {
              model.once('processed', function () {
                if (model.get('status') === 'Submitted') {
                  app.view.popup(model.get('result'));
                  model.destroy();
                } else {
                  app.view.pendingQueue();
                }
              });
              app.pending.processQueue();
            }
          });

          if (window.BMP.BIC3.history.length === 0) {
            window.BMP.BIC3.view.home();
          } else {
            history.back();
          }

        });
      }

    });

    return FormControlView;
  }
);
