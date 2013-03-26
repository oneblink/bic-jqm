define(
  ['backbone', 'api/API', 'pouchdb', 'jquery'],
  function (Backbone, API, Pouch, $) {
    "use strict";
    var data = {
      getModel: function (model, options) {
        var done, fail, jqXHR, fetch, dbType, createDocument, retrieveDocument, doc;

        done = function (data, status, xhr) {
          options.success(model, data, options);
        };

        fail = function (xhr, status, error) {
          if (options.error) {
            options.error(model, xhr, options);
          }
        };

        fetch = function () {
          switch (model.get("BICtype")) {
          case "Interaction":
            jqXHR = API.getInteraction(model.get('siteName'), model.get('name'), model.get('args')).done(done).fail(fail);
            break;
          case "AnswerSpace":
            jqXHR = API.getAnswerSpace(model.get('siteName')).done(done).fail(fail);
            break;
          case "DataSuitcase":
            jqXHR = API.getDataSuitcase(model.get('siteName'), model.get("name")).done(done).fail(fail);
            break;
          case "Form":
            jqXHR = API.getForm(model.get('siteName'), model.get("name")).done(done).fail(fail);
            break;
          default:
            options.error(model, null, options);
            jqXHR = null;
            break;
          }
          jqXHR.done(function (data, textStatus, jqXHR) {
            options.dfrd.resolve(data);
          });
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

        createDocument = function (jqXHR) {
          jqXHR.done(function (data, textStatus, jqXHR) {
            Pouch(dbType + model.get('siteName') +  '-' + model.get('BICtype'), function (err, db) {
              if (err) {
                console.log(err);
              } else {
                var d = new Date();
                data.fetchTime = d.getTime();
                db.put(data, function (err, response) {
                  if (err) {
                    console.log(err);
                  }
                });
              }
            });
          });
        };

        retrieveDocument = function () {
          var docdfrd = $.Deferred();
          Pouch(dbType + model.get('siteName') +  '-' + model.get('BICtype'), function (err, db) {
            var d = new Date();
            if (err) {
              docdfrd.reject(err);
            } else {
              if (!model.has("name")) {
                docdfrd.reject();
              } else {
                db.get(model.get('name'), function (err, doc) {
                  if (err) {
                    docdfrd.reject();
                  } else {
                    if (doc.deviceCacheTime === 0) {
                      docdfrd.resolve(doc);
                    } else if (model.has("args")) {
                      docdfrd.reject();
                    } else if ((d.getTime() - doc.fetchTime) < (doc.deviceCacheTime * 1000)) {
                      docdfrd.resolve(doc);
                    } else {
                      docdfrd.reject();
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
          }, function () {
            fetch();
            createDocument(jqXHR);
          });
        } else {
          fetch();
        }
      }
    };

    Backbone.sync = function (method, model, options) {
      options.dfrd = $.Deferred();
      data.getModel(model, options);
      return options.dfrd.promise();
    };
    return Backbone;
  }
);
