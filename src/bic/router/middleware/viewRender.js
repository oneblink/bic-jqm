define(function (require) {
  'use strict';

  // foreign modules

  var $ = require('jquery');

  // local modules

  var c = require('bic/console');

  // this module

  return function (jqmData, bicData, next) {
    var view = bicData.view;

    c.debug('Router.Middleware.viewRender()', jqmData.url);

    view.once('render', function () {
      view.$el.attr('data-url', jqmData.dataUrl);
      view.$el.attr('data-external-page', true);
      view.$el.one('pagecreate', $.mobile._bindPageRemove);

      next(null, jqmData, bicData);
    });
    view.render(jqmData);
  };
});
