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
        var dfrd, db, data;
        dfrd = new $.Deferred();
        data = this;
        db = new Pouch(this.dbAdapter() + this.name, function (err) {
          if (err) {
            dfrd.reject(err);
          } else {
            db.post(model.toJSON(), function (err, response) {
              if (err) {
                dfrd.reject(err);
              } else {
                data.read(response).done(function (doc) {
                  dfrd.resolve(doc);
                });
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
        db = new Pouch(this.dbAdapter() + this.name, function (err) {
          if (err) {
            dfrd.reject(err);
          } else {
            db.put(model.toJSON(), function (err) {
              if (err) {
                dfrd.reject(err);
              } else {
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
        var dfrd, db;
        dfrd = new $.Deferred();
        db = new Pouch(this.dbAdapter() + this.name, function (err) {
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
        db = new Pouch(this.dbAdapter() + this.name, function (err) {
          if (err) {
            dfrd.reject(err);
          } else {
            db.allDocs({include_docs: true}, function (err, response) {
              if (err) {
                dfrd.reject(err);
              } else {
                dfrd.resolve(_.map(response.rows, function (value) {
                  return value.doc;
                }));
              }
            });
          }
        });
        return dfrd.promise();
      },

      'delete': function (model) {
        var dfrd, db;
        dfrd = new $.Deferred();
        db = new Pouch(this.dbAdapter() + this.name, function (err) {
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

      deleteAll: function () {
        var dfrd;
        dfrd = new $.Deferred();

        Pouch.destroy(this.dbAdapter() + this.name, function (err, info) {
          dfrd.resolve();
        });

        return dfrd.promise();
      }
    });

    return Data;
  }
);
