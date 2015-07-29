define(function (require) {
  'use strict';

  // foreign modules

  var $ = require('jquery');
  var Backbone = require('backbone');
  var Forms = require('BlinkForms');
  var Mustache = require('mustache');
  var Promise = require('feature!promises');

  // local modules

  var Template = require('text!bic/template/form/controls.mustache');
  var app = require('bic/model/application');
  var API = require('bic/api');
  var USER_ACTIONS = require('bic/enum-user-actions');
  var MODEL_STATUS = require('bic/enum-model-status');
  var uiTools = require('bic/lib/ui-tools');


  //private functions
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

  function scrollToFirstError(invalidElements){
    invalidElements.errors[0].get('_view').scrollTo();
  }

  function checkFormForErrors(model){
    var formErrors = Forms.current.getInvalidElements();
    if( formErrors ){
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
      view = this;
      options = {
        hasStorage: app.hasStorage()
      };

      if (Forms.current.get('pages').length > 1) {
        pages = Forms.current.get('pages');
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

      Forms.current.get('pages').once('change', function () {
        Forms.once('pageInjected', function() {
          view.render();
        });
      });

      view.$el.html(Mustache.render(view.constructor.template, options));
      view.$el.trigger('create');
      return view;
    },

    firstFormPage: function () {
      var index;

      index = Forms.current.get('pages').current.index();

      if (index > 0) {
        Forms.current.get('pages').goto(0);
      }
    },

    lastFormPage: function () {
      var index, len;

      checkFormForErrors(this.model);

      len = Forms.current.get('pages').length;
      index = Forms.current.get('pages').current.index();

      //only move and render if required
      if (index < len - 1) {
        Forms.current.get('pages').goto(len - 1);
      }
    },

    nextFormPage: function () {
      var index;

      checkFormForErrors(this.model);

      index = Forms.current.get('pages').current.index();

      if (index < Forms.current.get('pages').length - 1) {
        Forms.current.get('pages').goto(index + 1);
      }
    },

    previousFormPage: function () {
      var index;

      index = Forms.current.get('pages').current.index();

      if (index > 0) {
        Forms.current.get('pages').goto(index - 1);
      }
    },

    formLeave: function (userAction) {
      var onLeave = Forms.current.get('onFormLeaveInteraction');

      if ( onLeave && onLeave[this.model.get('blinkFormAction')] ){
        return onLeave[this.model.get('blinkFormAction')]({ model: Forms.current, userAction: userAction});
      }

      if (app.history.length <= 1) {
        return app.view.home();
      }

      history.back();
    },

    formSubmit: function () {
      var me = this
        , model = this.model
        , formErrors;

      if ($('#submit').attr('disabled')){
        return;
      }

      uiTools.disableElement('#submit');

      if (app.hasStorage()) {
        formErrors = Forms.current.getInvalidElements();
        this.addToQueue( formErrors && formErrors.length ? MODEL_STATUS.DRAFT : MODEL_STATUS.PENDING)
            .then(leaveViewBy(this, USER_ACTIONS.SUBMIT))
            //CATCH - enable submit if there has been an error
            .then(undefined, function(invalidElements){
              me.model.trigger('showErrors');
              enableSubmit();
              scrollToFirstError(invalidElements);
            });
      } else {
        uiTools.showLoadingAnimation();
        Forms.current.data()
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
          }).then(uiTools.hideLoadingAnimation)
          //CATCH - enable submit if there has been an error
          .then(undefined, function(invalidElements){
            me.model.trigger('showErrors');
            enableSubmit();
            scrollToFirstError(invalidElements);
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
       .then(function(){
        $('#closePopup').one('popupafterclose', leaveViewBy(me, USER_ACTIONS.SAVE) );
        $('#closePopup').popup('close');
       })
       .then(undefined, function(invalidElements){
          enableSave();
          scrollToFirstError(invalidElements);
        });
    },

    formSave2: function () {
      uiTools.disableElement('#save');
      this.addToQueue(MODEL_STATUS.DRAFT)
          .then(function(updatedModel) {
            this.model.setArgument('pid', updatedModel.id);
            setTimeout(function() {
              enableSave();
            }, 1e3);
          }.bind(this))
          .then(undefined, function(invalidElements){
            enableSave();
            scrollToFirstError(invalidElements);
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
      var view = this
        , pendingModel;

      supressQueue = supressQueue || false;

      return new Promise(function (resolve, reject) {
        Forms.current.data().then(function (data) {
          var modelAttrs;
          var options = {};

          options.success = function (updatedModel) {
            var invalidElements;
            if (!supressQueue) {
              if (pendingModel.get('status') === MODEL_STATUS.DRAFT ) {
                invalidElements = Forms.current.getInvalidElements();
                if ( invalidElements && invalidElements.length ) {
                  return reject(invalidElements);
                }

              } else {
                pendingModel.once('processed', function () {
                  var result = pendingModel.get('result');

                  if (pendingModel.get('status') === MODEL_STATUS.SUBMITTED ) {
                    //This will display a message pop up on the return page.
                    if (!isHTML(result)) {
                      data = '<p>' + result + '</p>';
                    }
                    app.view.popup(result);
                    // successful submit, destroy the pending model and remove from
                    // the pending queue.
                    pendingModel.destroy();
                  } else {
                    //shows the pending queue on the new page
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

          if (view.model.getArgument('pid')){
            pendingModel = app.pending.get(view.model.getArgument('pid'));
            if ( pendingModel ){
              modelAttrs.id = view.model.getArgument('pid');
              pendingModel.save(modelAttrs, options);
              return;
            }

            //if we got here then args[pid] shouldn't be set as the model is not
            //in the process queue
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