define(['text!template-form-controls.mustache',
  'model-application',
  'api',
  'enum-user-actions'],
  function (Template, app, API, USER_ACTIONS) {
    'use strict';

    var isHTML = function (string) {
      var html$;
      if (!string || typeof string !== 'string' || !string.trim()) {
        return false;
      }
      if (typeof Node === 'undefined' || !Node.TEXT_NODE) {
        return true; // the string _might_ be HTML, we just can't tell
      }
      html$ = $.parseHTML(string);
      return !html$.every(function (el) {
        return el.nodeType === Node.TEXT_NODE;
      });
    };

    var checkForFormErrors = function(view, userAction){
      // helper function for better control over what happens when
      // an item is added to the queue
      return function(){
        if (_.isEmpty(BlinkForms.current.getErrors())) {
          view.formLeave(userAction);
        } else {
          $(window).trigger('pagechange');
        }
      };
    };

    var FormControlView = Backbone.View.extend({

      events: {
        'click #FormControls #submit': 'formSubmit',
        'click #FormControls #close': 'formClose',
        'click #FormControls #save': 'formSave2',
        'click #nextFormPage': 'nextFormPage',
        'click #previousFormPage': 'previousFormPage'
      },

      render: function () {
        var view, options;

        view = this;
        options = {
          hasStorage: app.hasStorage()
        };


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

      formLeave: function (userAction) {
        var onLeave = BlinkForms.current.get('onFormLeaveInteraction');

        if ( onLeave && onLeave[this.model.get('blinkFormAction')] ){
          return onLeave[this.model.get('blinkFormAction')]({ model: BlinkForms.current, userAction: userAction});
        }

        if (window.BMP.BIC3.history.length <= 1) {
          return window.BMP.BIC3.view.home();
        }

        history.back();
      },

      formSubmit: function () {
        var me = this;
        var model = this.model;
        if (app.hasStorage()) {
          if (_.isEmpty(BlinkForms.current.getErrors())) {
            this.addToQueue('Pending')
                .then(checkForFormErrors(this, USER_ACTIONS.SUBMIT));
          } else {
            this.addToQueue('Draft')
                .then(checkForFormErrors(this, USER_ACTIONS.SUBMIT));
          }
        } else {
          $.mobile.loading('show');
          BlinkForms.current.data()
            .then(function (data) {
              return API.setPendingItem(
                model.get('blinkFormObjectName'),
                model.get('blinkFormAction'),
                data
              );
            })
            .then(function (data) {
              if (!isHTML(data)) {
                data = '<p>' + data + '</p>';
              }
              app.view.popup(data);
              $('#popup').one('popupafterclose', function () {
                me.formLeave(USER_ACTIONS.SUBMIT);
              });
            }, function (jqXHR) {
              var status = jqXHR.status;
              var json;
              var html = '';
              try {
                json = JSON.parse(jqXHR.responseText);
              } catch (ignore) {
                json = { message: 'error ' + status };
              }
              if (json.message) {
                html += json.message;
              }
              if (status === 470 || status === 471 || json.errors) {
                if (typeof json.errors === 'object') {
                  html += '<ul>';
                  Object.keys(json.errors).forEach(function (key) {
                    html += '<li>' + key + ': ' + json.errors[key] + '</li>';
                  });
                  html += '</ul>';
                }
              }
              if (!isHTML(html)) {
                html = '<p>' + html + '</p>';
              }
              app.view.popup(html);
            }).then(function () {
              $.mobile.loading('hide');
            });
        }
      },

      formClose: function () {
        var that = this;
        $('#closePopup').popup({
          afteropen: function (event) {
            $(event.target).on('click', '#save', {view: that}, that.formSave.bind(that));
            $(event.target).on('click', '#discard', {view: that}, that.formDiscard.bind(that));
          },
          afterclose: function (event) {
            $(event.target).off('click', '#save');
            $(event.target).off('click', '#discard');
          }
        });
        $('#closePopup').popup('open');
      },

      formSave: function (e) {
        var me = this;
        e.data.view.addToQueue('Draft')
         .then(function(){
          $('#closePopup').one('popupafterclose', function () { me.formLeave(USER_ACTIONS.SAVE); });
          $('#closePopup').popup('close');
         });
      },

      formSave2: function () {
        this.addToQueue('Draft')
            .then(checkForFormErrors(this, USER_ACTIONS.SAVE));
      },

      formDiscard: function () {
        var me = this;
        $('#closePopup').one('popupafterclose', function () {
          me.formLeave(USER_ACTIONS.DISCARD);
        });
        $('#closePopup').popup('close');
      },

      addToQueue: function (status, supressQueue) {
        var view = this;
        var model;
        supressQueue = supressQueue || false;

        return new Promise(function (resolve, reject) {
          BlinkForms.current.data().then(function (data) {
            var modelAttrs;
            var options = {};

            options.success = function (updatedModel) {
              if (!supressQueue) {
                $(window).one('pagechange', function () {
                  if (!navigator.onLine || model.get('status') === 'Draft') {
                    app.view.pendingQueue();
                  } else {
                    model.once('processed', function () {
                      var result = model.get('result');
                      if (model.get('status') === 'Submitted') {
                        if (!isHTML(result)) {
                          data = '<p>' + result + '</p>';
                        }
                        app.view.popup(result);
                        model.destroy();
                      } else {
                        app.view.pendingQueue();
                      }
                    });
                    app.pending.processQueue();
                  }
                });
              }
              resolve(updatedModel);
            };

            options.error = reject;

            data._action = view.model.get('blinkFormAction');
            modelAttrs = {
              type: 'Form',
              status: status,
              name: view.model.get('blinkFormObjectName'),
              label: view.model.get('displayName'),
              action: view.model.get('blinkFormAction'),
              answerspaceid: view.model.get('dbid'),
              data: data
            };
            if (view.model.get('args')['args[pid]']) {
              model = app.pending.get(view.model.get('args')['args[pid]']);
              model.save(modelAttrs, options);
            } else {
              model = app.pending.create(modelAttrs, options);
            }
          });
        });
      }
    });

    return FormControlView;
  }
);
