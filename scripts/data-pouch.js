/*jslint unparam: true*/
/*jslint sub:true*/ // we need to use obj['prop'] instead of obj.prop for IE8
define(
  ['pouchdb'],
  function (Pouch) {
    "use strict";

    var Data = function (name) {//, apiTrigger, apiCall, apiParameters) {
      if (this.dbAdapter && name) {
        this.name = name;
      } else {
        this.name = 'BlinkMobile';
      }
    };

    _.extend(Data.prototype, {

      dbAdapter: function () {
        var type = false;
        if (window.BMP.isBlinkGap === true && Pouch.adapters.websql) {
          type = 'websql://';
        } else if (Pouch.adapters.idb) {
          type = 'idb://';
        }
        return type;
      },

      create: function (model) {
        var db, data;
        data = this;
        return new Promise(function (resolve, reject) {
          db = new Pouch(data.dbAdapter() + data.name, function (err) {
            if (err) {
              reject(err);
            } else {
              db.post(model.toJSON(), function (err, response) {
                if (err) {
                  reject(err);
                } else {
                  data.read(response).then(function (doc) {
                    resolve(doc);
                  });
                }
              });
            }
          });
        });
      },


      update: function (model) {
        var db, data;
        data = this;
        return new Promise(function (resolve, reject) {
          db = new Pouch(data.dbAdapter() + data.name, function (err) {
            if (err) {
              reject(err);
            } else {
              db.put(model.toJSON(), function (err) {
                if (err) {
                  reject(err);
                } else {
                  data.read(model).then(function (doc) {
                    resolve(doc);
                  });
                }
              });
            }
          });
        });
      },

      read: function (model) {
        var db, data;
        data = this;
        return new Promise(function (resolve, reject) {
          db = new Pouch(data.dbAdapter() + data.name, function (err) {
            if (err) {
              reject(err);
            } else {
              db.get(model.id, function (err, doc) {
                if (err) {
                  reject(err);
                } else {
                  resolve(doc);
                }
              });
            }
          });
        });
      },

      readAll: function () {
        var db, data;
        data = this;
        return new Promise(function (resolve, reject) {
          db = new Pouch(data.dbAdapter() + data.name, function (err) {
            if (err) {
              reject(err);
            } else {
              db.allDocs({include_docs: true}, function (err, response) {
                if (err) {
                  reject(err);
                } else {
                  resolve(_.map(response.rows, function (value) {
                    return value.doc;
                  }));
                }
              });
            }
          });
        });
      },

      'delete': function (model) {
        var db, data;
        data = this;
        return new Promise(function (resolve, reject) {
          db = new Pouch(data.dbAdapter() + data.name, function (err) {
            if (err) {
              reject(err);
            } else {
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
            }
          });
        });
      },

      deleteAll: function () {
        var data;
        data = this;

        return new Promise(function (resolve) {
          Pouch.destroy(data.dbAdapter() + data.name, function (err, info) {
            resolve();
          });
        });
      }
    });

    return Data;
  }
);
