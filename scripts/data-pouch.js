define(
  [],
  function () {
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
        var dfrd, db;
        dfrd = new $.Deferred();
        db = new Pouch(this.dbAdapter() + this.name, function (err, db) {
          if (err) {
            dfrd.reject(err);
          } else {
            db.post(model.toJSON(), function (err, response) {
              if (err) {
                dfrd.reject(err);
              } else {
                dfrd.resolve(response);
              }
            });
          }
        });
        return dfrd.promise();
      },


      update: function (model) {
        var dfrd, db, data;
        dfrd = new $.Deferred();
        data = this;
        db = new Pouch(this.dbAdapter() + this.name, function (err, db) {
          if (err) {
            dfrd.reject(err);
          } else {
            db.put(model.toJSON(), function (err, response) {
              if (err) {
                dfrd.reject(err);
              } else {
                //dfrd.resolve(response);
                data.read(model).done(function (doc) {
                  dfrd.resolve(doc);
                });
              }
            });
          }
        });
        return dfrd.promise();
      },

      read: function (model) {
        var dfrd, db, api;
        dfrd = new $.Deferred();
        db = new Pouch(this.dbAdapter() + this.name, function (err, db) {
          if (err) {
            dfrd.reject(err);
          } else {
            db.get(model.id, function (err, doc) {
              if (err) {
                dfrd.reject(err);
              } else {
                dfrd.resolve(doc);
              }
            });
          }
        });
        return dfrd.promise();
      },

      readAll: function () {
        var dfrd, db;
        dfrd = new $.Deferred();
        db = new Pouch(this.dbAdapter() + this.name, function (err, db) {
          if (err) {
            dfrd.reject(err);
          } else {
            db.allDocs({include_docs: true}, function (err, response) {
              if (err) {
                dfrd.reject(err);
              } else {
                dfrd.resolve(_.map(response.rows, function (value, key, list) {
                  return value.doc;
                }));
              }
            });
          }
        });
        return dfrd.promise();
      },

      delete: function (model) {
        var dfrd, db;
        dfrd = new $.Deferred();
        db = new Pouch(this.dbAdapter() + this.name, function (err, db) {
          if (err) {
            dfrd.reject(err);
          } else {
            db.get(model.id, function (err, doc) {
              if (err) {
                dfrd.reject(err);
              } else {
                db.remove(doc, function (err, doc) {
                  if (err) {
                    dfrd.reject(err);
                  } else {
                    dfrd.resolve(doc);
                  }
                });
              }
            });
          }
        });
        return dfrd.promise();
      }
    });

    return Data;
  }
);