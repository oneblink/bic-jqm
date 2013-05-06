define(
  ['api-php', 'pouchdb', 'jquery', 'underscore'],
  function (API, Pouch, $, _) {
    "use strict";
    var data = {
      dbType: function () {
        var type = false;
        if (window.NativeApp === true && Pouch.adapters.websql) {
          type = 'websql://';
        } else if (Pouch.adapters.idb) {
          type = 'idb://';
        }
        return type;
      },

      getModel: function (model, options) {
        var done, fail, jqXHR, fetch, createDocument, retrieveDocument, doc, dbType = this.dbType();

        done = function (data, status, xhr) {
          options.success(data);
        };

        fail = function (xhr, status, error) {
          if (options.error) {
            options.error(model, xhr, options);
          }
        };

        fetch = function () {
          switch (model.get("BICtype")) {
          case "Interaction":
            jqXHR = API.getInteraction(model.get('siteName'), model.get('_id'), model.get('args'),  options && options.data && options.data.options ? options.data.options : null).done(done).fail(fail);
            break;
          case "AnswerSpace":
            jqXHR = API.getAnswerSpace(model.get('siteName')).done(done).fail(fail);
            break;
          case "DataSuitcase":
            jqXHR = API.getDataSuitcase(model.get('siteName'), model.get("_id")).done(done).fail(fail);
            break;
          case "Form":
            jqXHR = API.getForm(model.get('siteName'), model.get("_id")).done(done).fail(fail);
            break;
          default:
            options.error(model, null, options);
            jqXHR = null;
            break;
          }
          if (jqXHR) {
            jqXHR.then(function (data, textStatus, jqXHR) {
              options.dfrd.resolve(data, textStatus, jqXHR);
            }, function (jqXHR, textStatus, errorThrown) {
              options.dfrd.reject(jqXHR, textStatus, errorThrown);
            });
          } else {
            options.dfrd.reject(null, '404', 'Invalid Model Type');
            jqXHR = new $.Deferred().reject('Invalid Model Type');
          }
        };

        createDocument = function (jqXHR, revision) {
          jqXHR.done(function (data, textStatus, jqXHR) {
            var db = new Pouch(dbType + model.get('siteName') +  '-' + model.get('BICtype'), function (err, db) {
              if (!err) {
                var d = new Date();

                if (revision) {
                  data._rev = revision;
                }

                db.put(data, function (err, response) {});
              }
            });
          });
        };

        retrieveDocument = function () {
          var docdfrd = new $.Deferred(), db;
          db = new Pouch(dbType + model.get('siteName') +  '-' + model.get('BICtype'), function (err, db) {
            var d = new Date();
            if (err) {
              docdfrd.reject(err);
            } else {
              if (!model.has("_id")) {
                docdfrd.reject();
              } else {
                db.get(model.get('_id'), function (err, doc) {
                  if (err) {
                    docdfrd.reject();
                  } else {
                    if (doc.deviceCacheTime === 0) {
                      docdfrd.resolve(doc);
                    } else if (model.has("args")) {
                      docdfrd.reject('Interaction has arguments', doc);
                    } else if ((d.getTime() - doc.fetchTime) < (doc.deviceCacheTime * 1000)) {
                      docdfrd.resolve(doc);
                    } else {
                      docdfrd.reject('Interaction too old', doc);
                    }
                  }
                });
              }
            }
          });
          return docdfrd.promise();
        };

        if (dbType !== false) {
          retrieveDocument().then(function (doc) {
            options.dfrd.resolve(doc);
            options.success(model, doc, options);
          }, function (err, doc) {
            fetch();

            var revision;
            if (doc) {
              revision = doc._rev;
            }
            createDocument(jqXHR, revision);
          });
        } else {
          fetch();
        }
      },

      getModels: function (models, options) {
        var pouch = new Pouch(this.dbType() + models.siteName +  '-Pending', function (err, db) {
          if (err) {
            options.dfrd.reject(null, '9001', 'Something in the DB was borked');
          } else {
            db.allDocs({include_docs: true}, function (err, response) {
              if (err) {
                options.dfrd.reject(null, '9001', 'Something in the DB was borked');
              } else {
                options.dfrd.resolve(_.map(response.rows, function (value, key, list) {
                  return value.doc;
                }));
              }
            });
          }
        });
      },

      setModels: function (models, options) {
        // Only for pending queue
        // TODO: Offline persistance

        //Online, submit those forms up
        if (navigator.onLine) {
          var promises = [],
            data = this;
          _.each(models.where({status: 'Pending'}), function (model) {
            promises.push(API.setPendingItem(model.get("answerspaceid"), model.get("name"), model.get("action"), model.get("data")));
          });

          $.when.apply($, promises).then(function () {
            var keptModels = models.where({status: 'Draft'}),
              pouch = new Pouch(data.dbType() + models.siteName +  '-Pending', function (err, db) {
                _.each(keptModels, function (model) {
                  db.put(model.attributes, function (err, response) {
                    if (err) {
                      options.dfrd.reject();
                    } else {
                      data.getModels(models, options);
                    }
                  });
                });
              });
            //options.dfrd.resolve(keptModels);
          }, function () {
            var keptModels = [],
              pouch;
            _.each(models.where({status: 'Draft'}), function (draft) {
              models.push(draft);
            });
            _.each(promises, function (promise) {
              promise.fail(function (unsubmitted) {
                keptModels.push(unsubmitted);
              });
            });
            pouch = new Pouch(data.dbType() + models.siteName +  '-Pending', function (err, db) {
              _.each(keptModels, function (model) {
                db.put(model.attributes, function (err, response) {
                  data.getModels(models, options);
                });
              });
            });
            //options.dfrd.reject(keptModels, '9000', 'One or more forms could not be uploaded to the server');
          });
        } else {
          //Offline, persist and desist
          console.log('todo');
        }
      }
    };
    return data;
  }
);
