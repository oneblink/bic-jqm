define(function (require) {
  'use strict';

  // foreign modules

  var Auth = require('authentication');

  // local modules

  var facade = require('bic/facade');
  var metaStore = require('bic/store-meta');

  // this module

  var auth = window.BMP.Authentication = new Auth();

  facade.subscribe('offlineAuthentication', 'storeAuth', function (authentication) {
    auth.setCurrent(authentication, function () {
      facade.publish('storeAuthSuccess');
    }, function () {
      facade.publish('storeAuthFailure');
    });
  });

  facade.subscribe('offlineAuthentication', 'authenticateAuth', function (authentication) {
    auth.authenticate(authentication, function () {
      facade.publish('loggedIn');
    }, function () {
      facade.publish('loggedOut');
    });
  });

  auth.getRecord = function (callback) {
    metaStore.read({
      id: 'offlineLogin'
    }).then(
      function (data) {
        callback(null, data.attributes);
      },
      function (err) {
        callback(err);
      }
    );
  };
  auth.setRecord = function (data, callback) {
    var model = {};
    model.id = 'offlineLogin';
    model.toJSON = function () {
      return model.attributes;
    };
    model.attributes = data;
    model.attributes._id = model.id;

    metaStore.read({
      id: model.id
    }).then(
      function () {
        metaStore.delete({
          id: model.id
        }).then(
          function () {
            metaStore.create(model).then(
              function (document) {
                callback(null, document);
              },
              function (err) {
                callback(err);
              }
            );
          },
          function (err) {
            callback(err);
          }
        );
      },
      function () {
        metaStore.create(model).then(
          function (document) {
            callback(null, document);
          },
          function (err) {
            callback(err);
          }
        );
      }
    );
  };

});
