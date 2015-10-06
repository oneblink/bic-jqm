define(function (require) {
  'use strict';

  // local modules

  var c = require('bic/console');

  // this module

  return function (jqmData, bicData, next) {
    var model = bicData.model;
    var onRequire = function (View) {
      var view = new View({
        tagName: 'div',
        model: model
      });
      bicData.view = view;
      next(null, jqmData, bicData);
    };

    c.debug('Router.Middleware.view()', jqmData.absUrl);

    if (model.get('type') === 'form') {
      require(['bic/view/interaction/form'], onRequire);
    } else {
      require(['bic/view/interaction'], onRequire);
    }
  };
});
