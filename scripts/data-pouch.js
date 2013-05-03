define(
  ['api-php', 'pouchdb', 'jquery', 'underscore'],
  function (API, Pouch, $, _) {
    "use strict";
    var data = {
      getModel: function (model, options) {
        var done, fail, jqXHR, fetch, dbType, createDocument, retrieveDocument, doc;

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

        if (window.NativeApp === true && Pouch.adapters.websql) {
          dbType = 'websql://';
        } else {
          if (Pouch.adapters.idb) {
            dbType = 'idb://';
          } else {
            dbType = false;
          }
        }

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
        options.dfrd.reject(null, '404', 'Collection.fetch not yet implemented');
      },

      setModels: function (models, options) {
        // Only for pending queue
        _.each(models.models, function (model) {
          API.setPendingItem(model.get("answerspaceid"), model.get("name"), model.get("action"), model.get("data")).then(function () {
            model = null;
          });
        });
      }
    };
    return data;
  }
);
