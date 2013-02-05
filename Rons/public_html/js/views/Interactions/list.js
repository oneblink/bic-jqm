/*jslint browser:true*/ // assume "window" and other browser globals
/*jslint white:true*/ // ignore white-space issues
/*global define:true, require:true*/ // globals from Require.JS

/*jslint nomen:true*/ // rules for Underscore.JS

define([
  'logger',
  'jQuery',
  'underscore',
  'backbone',
  'jQueryMobile'
  ], function(logger, $, _, Backbone, jqm) {
    'use strict';
    var $body = $('body'),
    bmp = window.BlinkApp,
    templates = jqm.templates,
    tplLabel = '<h3><%=text%></h3>',
    tplDesc = '<p><%=text%></p>',
    /**
     * @inner
     * @constructor
     */
    InteractionListView = Backbone.View.extend({
      initialize: function() {
        var $el = $(_.template(templates.page, { page: '' })),
        $content = $(_.template(templates.content, { content: '' })),
        $list = $(_.template(templates.listview, { items: '' })),
        category = this.collection.options.category,
        header = category && category.get('header'),
        footer = category && category.get('footer');
        /* END: var */
                
        this.setElement($el);
        
        // adding HTML elements to the DOM
        if (_.isString(header) && header.length > 0) {
          $el.append(header);
        }
        $list.appendTo($content);
        $content.appendTo($el);
        if (_.isString(footer) && footer.length > 0) {
          $el.append(footer);
        }
        $el.addClass('interactions');
        $el.appendTo($body);
      },
      render: function() {
        var $ol = this.$el.children('div').children('ul'),
        answerSpace = $body.jqmData('answerSpace'),
        path = this.collection.options.path;
        /* END: var */
        logger.log(this.options);
        
        $.each(this.collection.models, function(index, model) {
          var name = model.get('displayName') || model.get('name'),
          description = model.get('description'),
          html = _.template(tplLabel, { text: name }),
          $li;
          /* END: var */
          if (model.isViewable()) {
            if (!_.isEmpty(description)) {
              html += _.template(tplDesc, { text: description });
            }
            $li = $(_.template(templates.listitem, {
              href: path + model.get('name'),
              item: html
            }));
            $li.appendTo($ol);
          }
        });
        return this;
      },
      show: function() {
        var $ol = this.$el.children('div').children('ul');
        /* END: var */
        
        // TODO: figure how to detect when we need to re-render
        if ($ol.children().length === 0) {
          this.render();
        }
        jqm.changePage(this.$el);
      }
    });

    return InteractionListView;
  });
