define(
  [],
  function () {
    'use strict';

    var Data = function (name) {//, apiTrigger, apiCall, apiParameters) {
      var db;
      if (this.dbAdapter && name) {
        this.name = name;
      } else {
        this.name = 'BlinkMobile';
      }
      this.getDB = function () {
        var me = this;
        if (db) {
          return Promise.resolve(db);
        }
        return new Promise(function (resolve, reject) {
          var pouch;
          Pouch.prefix = '';
          pouch = new Pouch({
            name: me.name,
            adapter: me.dbAdapter(),
            /*eslint-disable camelcase*/
            auto_compaction: true
            /*eslint-enable camelcase*/
          }, function (err) {
            if (err) {
              reject(err);
            } else {
              db = pouch;
              resolve(db);
            }
          });
        });
      };
    };

    _.extend(Data.prototype, {

      dbAdapter: function () {
        var type = false;
        if (window.BMP.BIC.isBlinkGap === true && Pouch.adapters.websql) {
          type = 'websql';
        } else if (Pouch.adapters.idb) {
          type = 'idb';
        }
        return type;
      },

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
  }
);
