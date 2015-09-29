define(function (require) {
  'use strict';

  // foreign modules

  var $ = require('jquery');
  var _ = require('underscore');
  var Mustache = require('mustache');

  // local modules

  var FormView = require('bic/view/form');
  var InteractionView = require('bic/view/interaction');
  var Template = require('raw!bic/template/interaction.mustache');

  // this module

  return InteractionView.extend({

    initialize: function (options) {
      InteractionView.prototype.initialize.call(this, options);
    },

    render: function () {
      var inheritedAttributes = this.model.inherit({});

      // Non-type specific
      if (_.has(inheritedAttributes, 'themeSwatch')) {
        this.$el.attr('data-theme', inheritedAttributes.themeSwatch);
      }

      if ($('#ActiveFormContainer').length > 0) {
        $('#ActiveFormContainer').attr('id', 'FormContainer');
      }

      // Form
      this.$el.html(Mustache.render(Template, {
        header: inheritedAttributes.header,
        footer: inheritedAttributes.footer
      }));

      this.subView = new FormView({
        model: this.model,
        el: this.$el.children('[data-role="content"]')
      });

      this.listenToOnce(this.subView, 'render', function () {
        this.trigger('render');
      }.bind(this));

      this.subView.render();
    },

    remove: function () {
      if (this.subView) {
        this.subView.remove();
      }
      InteractionView.prototype.remove.apply(this, arguments);
    }

  });
});
