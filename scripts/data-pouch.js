define(
  ['api-php', 'pouchdb', 'jquery', 'underscore'],
  function (API, Pouch, $, _) {
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
      },

      deleteAll: function (model) {
        var dfrd, db;
        dfrd = new $.Deferred();
        db = new Pouch.destroy(this.name, function (err, info) {
          if (err) {
            dfrd.reject(err);
          } else {
            dfrd.resolve(info);
          }
        });
        return dfrd.promise();
      },

      apiRequest: function (model) {
        var dfrd;
        dfrd = new $.Deferred();
        if (this.apiCall) {
          dfrd = API[this.apiCall].apply(this, _.map(this.apiParameters, function (value, key, list) {
            return model.get(value);
          }));
        } else {
          dfrd.reject('No API call set');
        }
        return dfrd.promise();
      }

    });

    return Data;
  }
);