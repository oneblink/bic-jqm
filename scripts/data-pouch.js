/*jslint unparam: true*/
/*jslint sub:true*/ // we need to use obj['prop'] instead of obj.prop for IE8
define(
  [],
  function () {
    "use strict";

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
          var pouch = new Pouch(me.dbAdapter() + me.name, function (err) {
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
          type = 'websql://';
        } else if (Pouch.adapters.idb) {
          type = 'idb://';
        }
        return type;
      },

      create: function (model) {
        var data;
        data = this;
        return this.getDB().then(function (db) {
          return new Promise(function (resolve, reject) {
            db.post(model.toJSON(), function (err, response) {
              if (err) {
                reject(err);
              } else {
                data.read(response).then(function (doc) {
                  resolve(doc);
                });
              }
            });
          });
        });
      },

      update: function (model) {
        var data;
        data = this;
        return this.getDB().then(function (db) {
          return new Promise(function (resolve, reject) {
            db.put(model.toJSON(), function (err) {
              if (err) {
                reject(err);
              } else {
                data.read(model).then(function (doc) {
                  resolve(doc);
                });
              }
            });
          });
        });
      },

      read: function (model) {
        return this.getDB().then(function (db) {
          return new Promise(function (resolve, reject) {
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
        return this.getDB().then(function (db) {
          return new Promise(function (resolve, reject) {
            db.allDocs({include_docs: true}, function (err, response) {
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
        return this.getDB().then(function (db) {
          return new Promise(function (resolve, reject) {
            db.get(model.id, function (err, doc) {
              if (err) {
                reject(err);
              } else {
                db.remove(doc, function (err, doc) {
                  if (err) {
                    reject(err);
                  } else {
                    resolve(doc);
                  }
                });
              }
            });
          });
        });
      },

      deleteAll: function () {
        var data;
        data = this;

        return new Promise(function (resolve, reject) {
          Pouch.destroy(data.dbAdapter() + data.name, function (err, info) {
            if (err) {
              reject(err);
            } else {
              resolve();
            }
          });
        });
      }
    });

    return Data;
  }
);
