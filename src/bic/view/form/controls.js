define(function (require) {
  'use strict';

  // foreign modules

  var $ = require('jquery');
  var Backbone = require('backbone');
  var Mustache = require('mustache');
  var Promise = require('bic/promise');

  // local modules

  var Template = require('text!bic/template/form/controls.mustache');
  var app = require('bic/model/application');
  var API = require('bic/api');
  var USER_ACTIONS = require('bic/enum-user-actions');
  var MODEL_STATUS = require('bic/enum-model-status');
  var uiTools = require('bic/lib/ui-tools');
  var loadForms = require('bic/promise-forms');

  // private functions
  var isHTML = function (string) {
    var html$;
    var Node = window.Node;
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

  var leaveViewBy = function (view, userAction) {
    // helper function for better control over what happens when
    // an item is added to the queue
    return function (updatedModel) {
      view.formLeave(userAction);
      return updatedModel;
    };
  };

  var enableSubmit = function () {
    return uiTools.enableElement('#submit');
  };

  var enableSave = function () {
    return uiTools.enableElement('#save');
  };

  function checkFormForErrors (model) {
    var currentForm = model.attributes.currentForm;
    var formErrors = currentForm.getInvalidElements();
    if (formErrors) {
      model.trigger('showErrors');
    }

    return !!formErrors;
  }

  // this module

  return Backbone.View.extend({

    events: {
      'click #FormControls #submit:not([disabled])': 'formSubmit',
      'click #FormControls #close': 'formClose',
      'click #FormControls #save': 'formSave2',
      'click #nextFormPage': 'nextFormPage',
      'click #previousFormPage': 'previousFormPage',
      'click #firstFormPage': 'firstFormPage',
      'click #lastFormPage': 'lastFormPage'
    },

    render: function () {
      var view, options;
      var pages, index;
      var currentForm = this.model.attributes.currentForm;
      view = this;
      options = {
        hasStorage: app.hasStorage()
      };

      if (currentForm.get('pages').length > 1) {
        pages = currentForm.get('pages');
        index = pages.current.index();
        options.pages = {
          current: index + 1,
          total: pages.length,
          greaterThanTwo: pages.length > 2
        };

        if (pages.current.index() !== 0) {
          options.pages.previous = true;
        }

        if (pages.current.index() !== pages.length - 1) {
          options.pages.next = true;
        }
      }

      loadForms().then(function (Forms) {
        currentForm.get('pages').once('change', function () {
          Forms.once('pageInjected', function () {
            view.render();
          });
        });
      });

      view.$el.html(Mustache.render(view.constructor.template, options));
      view.$el.trigger('create');
      return view;
    },

    firstFormPage: function () {
      var index;
      var currentForm = this.model.attributes.currentForm;

      index = currentForm.get('pages').current.index();

      if (index > 0) {
        currentForm.get('pages').goto(0);
      }
    },

    lastFormPage: function () {
      var index, len;
      var currentForm = this.model.attributes.currentForm;

      checkFormForErrors(this.model);

      len = currentForm.get('pages').length;
      index = currentForm.get('pages').current.index();

      // only move and render if required
      if (index < len - 1) {
        currentForm.get('pages').goto(len - 1);
      }
    },

    nextFormPage: function () {
      var index;
      var currentForm = this.model.attributes.currentForm;

      checkFormForErrors(this.model);

      index = currentForm.get('pages').current.index();

      if (index < currentForm.get('pages').length - 1) {
        currentForm.get('pages').goto(index + 1);
      }
    },

    previousFormPage: function () {
      var index;
      var currentForm = this.model.attributes.currentForm;

      index = currentForm.get('pages').current.index();

      if (index > 0) {
        currentForm.get('pages').goto(index - 1);
      }
    },

    formLeave: function (userAction) {
      var currentForm = this.model.attributes.currentForm;
      var onLeave = currentForm.get('onFormLeaveInteraction');

      if (onLeave && onLeave[this.model.get('blinkFormAction')]) {
        return onLeave[this.model.get('blinkFormAction')]({ model: currentForm, userAction: userAction });
      }

      if (app.history.length <= 1) {
        return app.view.home();
      }

      window.history.back();
    },

    formSubmit: function () {
      var me = this;
      var model = this.model;
      var formErrors;
      var currentForm = this.model.attributes.currentForm;

      // called when process is blocked by validation errors
      var endWithErrors = function (errors) {
        model.trigger('showErrors');
        enableSubmit();
        currentForm.get('_view').goToElement(errors[0]);
      };

      if ($('#submit').attr('disabled')) {
        return;
      }

      uiTools.disableElement('#submit');

      formErrors = currentForm.getInvalidElements();

      if (formErrors && formErrors.length) {
        // stop if we have validation errors
        if (app.hasStorage()) {
          this.formSave2();
        }
        endWithErrors(formErrors);
        return;
      }

      if (app.hasStorage()) {
        this.addToQueue(MODEL_STATUS.PENDING)
            .then(leaveViewBy(this, USER_ACTIONS.SUBMIT))
            .catch(function (invalidElements) {
              endWithErrors(invalidElements.errors);
            });
      } else {
        uiTools.showLoadingAnimation();
        currentForm.data()
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
          })
          .then(uiTools.hideLoadingAnimation)
          .catch(function (invalidElements) {
            endWithErrors(invalidElements.errors);
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
      e.data.view.addToQueue(MODEL_STATUS.DRAFT)
      .then(function () {
        $('#closePopup').one('popupafterclose', leaveViewBy(me, USER_ACTIONS.SAVE));
        $('#closePopup').popup('close');
      })
      .catch(function (invalidElements) {
        enableSave();
        me.model.attributes.currentForm.get('_view').goToElement(invalidElements.errors[0]);
      });
    },

    formSave2: function () {
      uiTools.disableElement('#save');
      return this.addToQueue(MODEL_STATUS.DRAFT, true)
          .then(function (updatedModel) {
            this.model.setArgument('pid', updatedModel.id);
            setTimeout(function () {
              enableSave();
            }, 1e3);

            return updatedModel;
          }.bind(this))
          .catch(function () {
            enableSave();
          });
    },

    formDiscard: function () {
      $('#closePopup').one('popupafterclose', leaveViewBy(this, USER_ACTIONS.DISCARD));
      $('#closePopup').popup('close');
    },

    /**
      Adds the Current Blink Form to the pending que with the specified status

      @param {MODEL_STATUS_ENUM}  status - The status of the model. Refer to the enum {@link MODEL_STATUS_ENUM  Definition}
      @param {boolean} supressQueue - Supresses the checking of errors and processing of the queue.

      returns {Promise} A promise that is resolved with the updated model or rejected if there are
      **client side** errors.
    */
    addToQueue: function (status, supressQueue) {
      var view = this;
      var pendingModel;
      var currentForm = this.model.attributes.currentForm;

      supressQueue = supressQueue || false;

      return new Promise(function (resolve, reject) {
        currentForm.data().then(function (data) {
          var modelAttrs;
          var options = {};

          options.success = function (updatedModel) {
            var invalidElements;
            if (!supressQueue) {
              if (pendingModel.get('status') === MODEL_STATUS.PENDING) {
                invalidElements = currentForm.getInvalidElements();
                if (invalidElements && invalidElements.length) {
                  return reject(invalidElements);
                }
                pendingModel.once('processed', function () {
                  var result = pendingModel.get('result');

                  if (pendingModel.get('status') === MODEL_STATUS.SUBMITTED) {
                    // .fseventsd/This will display a message pop up on the return page.
                    if (!isHTML(result)) {
                      data = '<p>' + result + '</p>';
                    }
                    app.view.popup(result);
                    // successful submit, destroy the pending model and remove from
                    // the pending queue.
                    pendingModel.destroy();
                  } else {
                    // shows the pending queue on the new page
                    app.view.pendingQueue();
                  }
                });

                // send the queue to the server
                app.pending.processQueue();
              }
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

          if (view.model.getArgument('pid')) {
            pendingModel = app.pending.get(view.model.getArgument('pid'));
            if (pendingModel) {
              modelAttrs.id = view.model.getArgument('pid');
              pendingModel.save(modelAttrs, options);
              return;
            }

            // if we got here then args[pid] shouldn't be set as the model is not
            // in the process queue
            view.model.setArgument('pid', null);
          }

          pendingModel = app.pending.create(modelAttrs, options);
        });
      });
    }
  }, {
    template: Template
  });
});
