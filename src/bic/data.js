define(function (require) {
  'use strict';

  // foreign modules

  var _ = require('underscore');
  var Pouch = require('pouchdb');
  var Promise = require('feature!promises');

  // local modules

  var whenPickStorage = require('bic/promise-pick-storage');
  var noopPouch = require('bic/pouchdb-noop');

  // this module

  var Data = function (name) {// , apiTrigger, apiCall, apiParameters) {
    var self = this;
    var db;
    this.name = name || 'BlinkMobile';
    this.ready = false;

    this.hasStorage = function () {
      return !!(db && db !== noopPouch);
    };

    this.getDB = function () {
      var me = this;
      if (db) {
        return Promise.resolve(db);
      }
      return whenPickStorage.then(function (type) {
        if (!type) {
          db = noopPouch;
          self.ready = true;
          return Promise.resolve(db);
        }
        return new Promise(function (resolve, reject) {
          var pouch;
          Pouch.prefix = '';
          pouch = new Pouch({
            name: me.name,
            adapter: type,
            /*eslint-disable camelcase*/
            auto_compaction: true
            /*eslint-enable camelcase*/
          }, function (err) {
            if (err) {
              reject(err);
            } else {
              db = pouch;
              self.ready = true;
              resolve(db);
            }
          });
        });
      });
    };
  };

  _.extend(Data.prototype, {

    create: function (model) {
      var that = this;
      return new Promise(function (resolve, reject) {
        if (!model.toJSON) {
          return reject('Invalid model');
        }
        that.getDB().then(function (db) {
          db.post(model.toJSON(), function (err, response) {
            if (err) {
              reject(err);
            } else {
              that.read(response).then(function (doc) {
                resolve(doc);
              }, function (rErr) {
                reject(rErr);
              });
            }
          });
        });
      });
    },

    update: function (model) {
      var that = this;
      return new Promise(function (resolve, reject) {
        if (!model.toJSON) {
          return reject('Invalid model');
        }
        that.getDB().then(function (db) {
          db.put(model.toJSON(), function (err) {
            if (err) {
              reject(err);
            } else {
              that.read(model).then(function (doc) {
                resolve(doc);
              });
            }
          });
        });
      });
    },

    read: function (model) {
      var that = this;
      return new Promise(function (resolve, reject) {
        if (!model.id) {
          return reject('Invalid model');
        }
        that.getDB().then(function (db) {
          db.get(model.id, function (err, doc) {
            if (err) {
              reject(err);
            } else {
              resolve(doc);
            }
          });
        });
      });
    },

    readAll: function () {
      var that = this;
      return new Promise(function (resolve, reject) {
        that.getDB().then(function (db) {
          /*eslint-disable camelcase*/
          db.allDocs({include_docs: true}, function (err, response) {
            /*eslint-enable camelcase*/
            if (err) {
              reject(err);
            } else {
              resolve(_.map(response.rows, function (value) {
                return value.doc;
              }));
            }
          });
        });
      });
    },

    'delete': function (model) {
      var that = this;
      return new Promise(function (resolve, reject) {
        if (!model.id) {
          return reject('Invalid model');
        }
        that.getDB().then(function (db) {
          db.get(model.id, function (err, doc) {
            if (err) {
              reject(err);
            } else {
              db.remove(doc, function (innerErr, innerDoc) {
                if (innerErr) {
                  reject(innerErr);
                } else {
                  resolve(innerDoc);
                }
              });
            }
          });
        });
      });
    },

    deleteAll: function () {
      var that = this;

      return new Promise(function (resolve, reject) {
        that.getDB().then(function (db) {
          db.destroy(function (err) {
            if (err) {
              reject(err);
            } else {
              that.db = null;
              resolve();
            }
          });
        });
      });
    }
  });

  return Data;
});
