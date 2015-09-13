define(function (require) {
  'use strict';

  // foreign modules

  var Backbone = require('backbone');
  var $ = require('jquery');
  var _ = require('underscore');
  var Mustache = require('mustache');

  // local modules
  var defaultTemplate = require('text!bic/template/form/forms-error-summary.mustache');

  var defaultNumberOfErrors = 4;

  /**
   * Shows a summary of the errors below the form and above the controls.
   */
  var FormsErrorSummaryListView = Backbone.View.extend({
    tagName: 'ul',
    className: 'bm-errorsummary',

    attributes: {
      'data-corners': 'true',
      'data-theme': 'a',
      'data-shadow': 'false',
      'data-role': 'listview',
      'data-ajax': false,
      'data-inset': true
    },

    events: {
      'click [data-onclick="gotoField"]': 'gotoField',
      'click [data-onclick="showAll"]': 'showAll',
      'click [data-onclick="showLess"]': 'showLess'
    },

    initialize: function () {
      this.showLess();
      this.listenTo(this.model, 'change:numErrorsShown valid invalid', this.render);

      Backbone.View.prototype.initialize.apply(this, arguments);
    },

    remove: function () {
      this.stopListening(this.model);
      Backbone.View.prototype.remove.apply(this, arguments);
    },

    gotoField: function (e) {
      return this.model.get('_view').goToElement($(e.target).attr('for'));
    },

    showLess: function () {
      this.model.set('numErrorsShown', defaultNumberOfErrors);
    },

    showAll: function () {
      this.model.set('numErrorsShown', 0);
    },

    getLimit: function () {
      var limit = this.model.get('numErrorsShown');
      if (defaultNumberOfErrors === limit && !_.isUndefined(FormsErrorSummaryListView.limit)) {
        limit = FormsErrorSummaryListView.limit;
      }

      return limit;
    },

    render: function () {
      var errors = this.model.getInvalidElements({ limit: this.getLimit() });
      var template = '';
      var viewModel;

      // mustache doesnt do simple calculations :\
      if (errors) {
        viewModel = {
          invalidElements: errors.errors,
          moreAvailable: errors.total > errors.length,
          remaining: errors.total - errors.length
        };

        template = FormsErrorSummaryListView.template(viewModel);
      }

      this.$el.html(template);

      /* eslint-disable no-unused-expressions */
      this.$el.is(':visible') && this.$el.listview().listview('refresh');
      /* eslint-enable no-unused-expressions */

      this.trigger('render');

      return this;
    },

    enhance: function () {
      this.$el.listview().listview('refresh');
      return this;
    }
  }, {
    // static properties.
    /**
     * Override to allow for custom LI elements
     * @param  {Object} viewModel An object to be rendered.
     * @return {string} The rendered template.
     */
    template: function (viewModel) {
      return Mustache.render(defaultTemplate, viewModel);
    },

    /**
     * Override to change the default amount of errors to show before "show all"
     * is called
     * @type {Number}
     */
    limit: undefined
  });

  return FormsErrorSummaryListView;
});
