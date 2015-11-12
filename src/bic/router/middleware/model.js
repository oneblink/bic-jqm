define(function (require) {
  'use strict';

  // local modules

  var c = require('bic/console');

  // this module

  return function (jqmData, bicData, next) {
    var app = bicData.app;
    var path = bicData.path;
    var model;

    c.debug('Router.Middleware.model()');

    if (!bicData.model) {
      model = app.router.inheritanceChain(path);
      model.setArgsFromQueryString(path.search);
    } else {
      model = bicData.model;
    }
    app.currentInteraction = model;
    bicData.model = model;

    model.prepareForView(jqmData)
      .then(function (finalModel) {
        bicData.model = finalModel;
        next(null, jqmData, bicData);
      })
      .catch(function (err) {
        next(err, jqmData, bicData);
      });
  };
});
