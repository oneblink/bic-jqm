define(function (require) {
  'use strict';

  // foreign modules

  var PendingQueue;
  var $ = require('jquery');
  var _ = require('underscore');
  var Mustache = require('mustache');
  var Backbone = require('backbone');

  // local modules

  // ...

  // templates
  var Template = require('text!bic/template/form/pending.mustache');
  var clearConfirmationTemplate = require('text!bic/template/form/pending-clear-confirmation-popup.mustache');

  // utils
  var uiTools = require('bic/lib/ui-tools');
  var MODEL_STATUS = require('bic/enum-model-status');

  // this module

  PendingQueue = Backbone.View.extend({

    events: {
      'click [data-onclick="clearPendingItem"]': 'clearPendingItem',
      'click [data-onclick="submitPendingItems"]': 'submitPendingItems',
      'click [data-onclick="clearPendingItems"]': 'clearPendingItems',
      'click [data-onclick="clearPendingItemsConfirmation"]': 'clearPendingItemsConfirmation'
    },

    render: function () {
      var view;
      var app;
      var templateObject;
      var statuses;
      var pendingExtractor;
      var $popup;

      view = this;
      app = require('bic/model/application');
      templateObject = {};
      statuses = {
        'pending': MODEL_STATUS.PENDING,
        'draft': MODEL_STATUS.DRAFT,
        'validation': MODEL_STATUS.FAILED_VALIDATION
      };
      pendingExtractor = function (status) {
        return _.map(app.pending.where({status: status}), function (pendingItem) {
          var pendingAttrs = _.clone(pendingItem.attributes);
          if (!pendingAttrs._id) {
            pendingAttrs._id = pendingItem.cid;
          }
          pendingAttrs.editInteraction = app.interactions.where({
            blinkFormObjectName: pendingItem.get('name'),
            blinkFormAction: pendingItem.get('action')
          });
          if (pendingAttrs.editInteraction && pendingAttrs.editInteraction.length > 0) {
            pendingAttrs.editInteraction = pendingAttrs.editInteraction[0].id;
          } else {
            pendingAttrs.editInteraction = null;
          }
          if (!pendingAttrs.label) {
            pendingAttrs.label = pendingAttrs.name;
          }
          return pendingAttrs;
        });
      };

      _.each(statuses, function (flag, status) {
        templateObject[status] = pendingExtractor(flag);
        templateObject[status + "Present"] = templateObject[status].length > 0;
      });

      view.$el.append(Mustache.render(view.constructor.template, templateObject));
      view.$el.trigger('pagecreate');

      $popup = $('#pendingPopup');
      $popup.one('popupafterclose', function () {
        $popup.remove();
      });
      $popup.popup('open');
    },

    clearPendingItem: function (e) {
      var $element;
      var $popup;
      var app;

      $popup = $('#pendingPopup');
      app = require('bic/model/application');

      if (e.target.tagName !== 'A') {
        $element = $(e.target).parents('a');
      } else {
        $element = $(e.target);
      }

      app.pending.get($element[0].attributes._pid.value).destroy();
      $popup.popup('close');
    },

    submitPendingItems: function () {
      var $popup;
      var app;

      $popup = $('#pendingPopup');
      app = require('bic/model/application');

      uiTools.showLoadingAnimation();

      app.pending.processQueue()
        .then(null, function () {
          return null;
        })
        .then(function () {
          $popup.one('popupafterclose', uiTools.hideLoadingAnimation);
          $popup.popup('close');
        });
    },

    clearPendingItems: function () {
      var items;
      var $popup, i;
      var app;

      $popup = $('#clearConfirmationPopup');
      app = require('bic/model/application');

      items = app.pending.where({status: MODEL_STATUS.DRAFT});

      for (i = 0; i < items.length; i = i + 1) {
        items[i].destroy();
      }

      $popup.one('popupafterclose', function () {
        $popup.remove();
      });
      $popup.popup('close');
    },

    clearPendingItemsConfirmation: function () {
      var view;
      var $popup;

      view = this;
      $popup = $('#pendingPopup');

      $popup.one('popupafterclose', function () {
        $('#clearConfirmationPopup').popup({
          afterclose: function () {
            $('#clearConfirmationPopup').remove();
          }
        });
        setInterval(function () {
          $('#clearConfirmationPopup').popup('open');
        }, 100);
      });

      this.$el.append(Mustache.render(view.constructor.clearConfirmationTemplate, {}));
      this.$el.trigger('pagecreate');
      $popup.popup('close');
    }
  }, {
    template: Template,
    clearConfirmationTemplate: clearConfirmationTemplate
  });

  return PendingQueue;
});
