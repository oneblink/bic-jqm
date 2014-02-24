define(
  [],
  function () {
    "use strict";
    var XsltView = Backbone.View.extend({
      render: function (parentView) {
        var result = this.model.performXSLT(),
          content;
        if (typeof result === 'object') {
          parentView.$el.children('[data-role=content]')[0].appendChild(parentView.model.get("content"));
        } else if (result === 'string') {
          content = parentView.model.get("content");
        } else {
          content = "Unknown error rendering XSLT interaction.";
        }
        return content;
      }
    });

    return XsltView;
  }
);
