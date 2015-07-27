define(function (require) {
  'use strict';

  // foreign modules

  var Backbone = require('backbone');
  var Forms = require('BlinkForms');
  var $ = require('jquery');
  var _ = require('underscore');
  var Mustache = require('mustache');

  // local modules
  var defaultTemplate = require('text!bic/template/form/forms-error-summary.mustache');

  var defaultNumberOfErrors = 4;
// this module
  var FormsErrorSummaryListView;

  // https://github.com/jquery/jquery-mobile/issues/4919
  // jquery mobile 1.3 needs the list views to be inside a
  // data-role="page" element that has been initialised and enhanced
  // otherwise an error is thrown. However, due to the current way that
  // a page is rendered, if there are errors on the page at initialisation
  // the page element is not yet enhanced. Without re-writing the way we render,
  // we'll do a hacky thing and just set timeouts to continue until intiailised.
  //
  // this will bail out after 10 attempts to enhance the content
  function enhanceElement($el){
    var t, i = 0;
    if ( $el.is(':visible') ){
      $el.listview('refresh');

      return;
    }

    t = function(){
      if ( !$el.is(':visible')){
        if ( ++i < 10 ){
          setTimeout(t, 125);
        }
        return;
      }
      $el.listview('refresh');
    };

    setTimeout(t, 125);
  }

  /**
   * Shows a summary of the errors below the form and above the controls.
   */
  FormsErrorSummaryListView = Backbone.View.extend({
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

    initialize: function(){
      this.showLess();
      this.listenTo(this.model, 'change:numErrorsShown change:value invalid', this.render);

      Backbone.View.prototype.initialize.apply(this, arguments);
    },

    remove: function(){
      this.stopListening(this.model);
      Backbone.View.prototype.remove.apply(this, arguments);
    },

    gotoField: function(e){
      return Forms.current.get('_view').goToElement($(e.target).attr('for'));
    },

    showLess: function(){
      this.model.set('numErrorsShown', defaultNumberOfErrors);
    },

    showAll: function(){
      this.model.set('numErrorsShown', 0);
    },

    getLimit: function(){
      var limit = this.model.get('numErrorsShown');
      if ( defaultNumberOfErrors === limit && !_.isUndefined( FormsErrorSummaryListView.limit ) ){
        limit = FormsErrorSummaryListView.limit;
      }

      return limit;
    },

    render: function(){
      var errors = this.model.getInvalidElements( { limit: this.getLimit() } );
      var template = '';
      var viewModel;
      this.$el.empty();
      //mustache doesnt do simple calculations :\
      if ( errors && errors.length ){
        viewModel = {
          invalidElements: errors,
          moreAvailable: errors.total > errors.length,
          remaining: errors.total - errors.length
        };

        template = FormsErrorSummaryListView.template( viewModel );
      }

      this.$el.html(template);
      enhanceElement(this.$el);

      return this;
    }
  }, //static properties.
  {
    /**
     * Override to allow for custom LI elements
     * @param  {Object} viewModel An object to be rendered.
     * @return {string} The rendered template.
     */
    template: function(viewModel){
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
