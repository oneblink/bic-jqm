define(['Squire'], function (Squire) {
  'use strict';

  if (window.indexedDB && window.indexedDB.open('idbTest', 1).onupgradeneeded === null) {
    describe('Data Abstraction Layer - PouchDB', function () {
      var Data, data, model;

      before(function (done) {
        var injector = new Squire();

        model = {
          toJSON: function () {
            return {cat: 'hat'};
          }
        };

        injector.require(['bic/data'], function (required) {
          Data = required;
          done();
        });
      });

      beforeEach(function (done) {
        data = new Data('unitTests');
        done();
      });

      afterEach(function (done) {
        // Seems odd to be doing an insert before we wipe the db, no?
        // Well listen up kiddo!
        // This ensures that the DB actually exists
        // Or all hell breaks loose in the land of DOMException
        // Where wilderbeats roam free
        // And the dread lord DOM walks the land

        data.create(model)
        .then(function () {
          return data.deleteAll();
        })
        .then(function () {
          done();
        })
        .then(null, function () {
          done();
        });
      });

      it('should be a constructor', function () {
        expect(Data).to.be.a('function');
        // Just assume that beforeEach has handled this
        // Or you are in a world of pain
        expect(data).to.be.an('object');
      });

      describe('#hasStorage', function () {
        it('should be a function', function () {
          expect(data.hasStorage).to.be.a('function');
        });

        it('should return a boolean', function () {
          assert.isBoolean(data.hasStorage());
        });
      });

      describe('#getDB', function () {
        it('should be a function', function () {
          expect(data.getDB).to.be.a('function');
        });

        it('should return a promise', function () {
          expect(data.getDB()).to.be.instanceOf(Promise);
        });

        it('should resolve with a db', function (done) {
          data.getDB().then(function (db) {
            expect(db).to.not.equal(undefined).and.not.equal(null);
            expect(db).to.be.an('object');
            expect(db).to.have.property('get');
            expect(db).to.have.property('post');
            expect(db).to.have.property('put');
            expect(db).to.have.property('allDocs');
            expect(db).to.have.property('remove');
            done();
          });
        });
      });

      describe('promise-pick-storage', function () {
        var promise;

        before(function (done) {
          require(['bic/promise-pick-storage'], function (mod) {
            promise = mod;
            done();
          });
        });

        it('should be a Promise', function () {
          expect(promise).to.be.instanceOf(Promise);
        });

        it('should return a persistent storage type when available', function (done) {
          promise.then(function (type) {
            if (window.BMP.BIC.isBlinkGap) {
              assert.include(['websql', 'idb'], type);
            } else if (type) {
              assert.equal(type, 'idb');
            }
            done();
          }, function (err) {
            assert.notOk(err);
            done();
          });
        });
      });

      describe('#create', function () {
        it('should be a function', function () {
          expect(data.create).to.be.a('function');
        });

        it('should return an XHR compatible promise', function () {
          var promise = data.create({});
          promise.then(null, function () { return; });
          expect(promise).to.be.instanceOf(Promise);
        });

        it('should resolve with the newly created object', function (done) {
          if (!data.hasStorage()) {
            done();
            return;
          }
          data.create(model).then(function (doc) {
            try {
              expect(doc).to.not.equal(undefined).and.not.equal(null);
              expect(doc._id).to.not.equal(undefined).and.not.equal(null);
              if (data.hasStorage()) {
                expect(doc.cat).to.equal('hat');
              }
              done();
            } catch (err) {
              window.console.error(err);
            }
          });
        });

        it('should create an object in the database', function (done) {
          if (!data.hasStorage()) {
            done();
            return;
          }
          data.getDB().then(function (db) {
            db.allDocs(function (err, response) {
              expect(err).to.not.equal(undefined);
              expect(response).to.not.equal(undefined).and.not.equal(null);
              expect(response).to.be.an('object');
              expect(response.total_rows).to.equal(0);
              data.create(model).then(function () {
                db.allDocs(function (innerErr, innerResponse) {
                  expect(innerErr).to.not.equal(undefined);
                  expect(innerResponse).to.be.an('object');
                  expect(innerResponse.total_rows).to.equal(1);
                  done();
                });
              });
            });
          });
        });
      });

      describe('#update', function () {
        it('should be a function', function () {
          expect(data.update).to.be.a('function');
        });

        it('should return an XHR compatible promise', function () {
          var promise = data.update({});
          promise.then(null, function () { return; });
          expect(promise).to.be.instanceOf(Promise);
        });

        it('should resolve with the updated object', function (done) {
          if (!data.hasStorage()) {
            done();
            return;
          }
          data.create(model).then(function (createdModel) {
            expect(createdModel).to.have.property('_id');
            expect(createdModel).to.have.property('_rev');
            createdModel.id = createdModel._id;
            createdModel.toJSON = function () {
              return {
                _id: createdModel._id,
                _rev: createdModel._rev,
                cat: createdModel.cat,
                hat: 'cat'
              };
            };
            data.update(createdModel).then(function (updatedModel) {
              expect(updatedModel).to.not.equal(undefined).and.not.equal(null);
              expect(updatedModel).to.have.property('hat', 'cat');
              done();
            });
          });
        });

        it('should update the object in the database', function (done) {
          if (!data.hasStorage()) {
            done();
            return;
          }
          data.create(model).then(function (createdModel) {
            expect(createdModel).to.have.property('_id');
            expect(createdModel).to.have.property('_rev');
            createdModel.id = createdModel._id;
            createdModel.toJSON = function () {
              return {
                _id: createdModel._id,
                _rev: createdModel._rev,
                cat: createdModel.cat,
                hat: 'cat'
              };
            };
            data.update(createdModel).then(function () {
              data.getDB().then(function (db) {
                db.get(createdModel._id, function (err, doc) {
                  expect(err).to.not.equal(undefined);
                  expect(doc).to.not.equal(undefined).and.not.equal(null);
                  expect(doc).to.have.property('hat', 'cat');
                  done();
                });
              });
            });
          });
        });

        it('should reject if the _id field is not present', function (done) {
          data.update(model).then(null, function () {
            done();
          });
        });

        it('should reject if the item could not be updated', function (done) {
          if (!data.hasStorage()) {
            done();
            return;
          }
          data.create(model).then(function (createdModel) {
            createdModel.id = createdModel._id;
            createdModel.toJSON = function () {
              return {
                _id: createdModel._id,
                _rev: 0,
                cat: createdModel.cat,
                hat: 'cat'
              };
            };
            data.update(createdModel).then(null, function (err) {
              expect(err).to.not.equal(undefined).and.not.equal(null);
              done();
            });
          });
        });
      });

      describe('#read', function () {
        it('should be a function', function () {
          expect(data.read).to.be.a('function');
        });

        it('should return an XHR compatible promise', function () {
          var promise = data.read({});
          promise.then(null, function () { return; });
          expect(promise).to.be.instanceOf(Promise);
        });

        it('should resolve with the object from the db', function (done) {
          if (!data.hasStorage()) {
            done();
            return;
          }
          data.create(model).then(function (createdModel) {
            data.read({id: createdModel._id}).then(function (doc) {
              expect(doc).to.not.equal(undefined).and.not.equal(null);
              expect(doc).to.have.property('cat', 'hat');
              done();
            });
          });
        });

        it('should reject if the object could not be retreived', function (done) {
          data.read({id: 1}).then(null, function (err) {
            expect(err).to.not.equal(undefined).and.not.equal(null);
            done();
          });
        });
      });

      describe('#readAll', function () {
        it('should be a function', function () {
          expect(data.readAll).to.be.a('function');
        });

        it('should return an XHR compatible promise', function () {
          expect(data.readAll()).to.be.instanceOf(Promise);
        });

        it('should resolve with all the objects stored in the db', function (done) {
          if (!data.hasStorage()) {
            data.readAll().then(function (docs) {
              expect(docs).to.not.equal(undefined).and.not.equal(null);
              expect(docs).to.be.an('array');
              expect(docs).to.have.property('length', 0);
              done();
            });
            return;
          }
          data.readAll().then(function (docs) {
            expect(docs).to.not.equal(undefined).and.not.equal(null);
            expect(docs).to.be.an('array');
            expect(docs).to.have.property('length', 0);
            data.create(model).then(function () {
              data.readAll().then(function (innerDocs) {
                expect(innerDocs).to.not.equal(undefined).and.not.equal(null);
                expect(innerDocs).to.be.an('array');
                expect(innerDocs).to.have.property('length', 1);
                expect(innerDocs[0]).to.have.property('cat', 'hat');
                done();
              });
            });
          });
        });

        //it('should reject with an error', function (done) {
          //data.dbAdapter = function () { return 'iwgiapugpi://'; };
          //data.readAll().then(
            //function (err) {
              //expect(err).to.not.equal(undefined).and.not.equal(null);
              //done();
            //}
          //);
        //});
      });

      describe('#delete', function () {
        it('should be a function', function () {
          expect(data.delete).to.be.a('function');
        });

        it('should return an XHR compatible promise', function () {
          var promise = data.delete({});
          promise.then(null, function () { return; });
          expect(promise).to.be.instanceOf(Promise);
        });

        it('should resolve with deletion confirmation', function (done) {
          if (!data.hasStorage()) {
            done();
            return;
          }
          data.create(model).then(function (createdModel) {
            data.delete({id: createdModel._id}).then(function (doc) {
              expect(doc).to.not.equal(undefined).and.not.equal(null);
              expect(doc).to.have.property('ok', true);
              data.readAll().then(function (docs) {
                expect(docs).to.not.equal(undefined).and.not.equal(null);
                expect(docs).to.have.property('length', 0);
                done();
              });
            });
          });
        });

        it('should reject with any errors encountered', function (done) {
          data.delete({id: 1}).then(null, function (err) {
            expect(err).to.not.equal(undefined).and.not.equal(null);
            done();
          });
        });
      });

      describe('#deleteAll', function () {
        it('should be a function', function () {
          expect(data.deleteAll).to.be.a('function');
        });

        it('should return an XHR compatible promise', function (done) {
          var del = data.deleteAll();
          expect(del).to.be.instanceOf(Promise);
          del.then(
            function () {
              done();
            },
            function () {
              done();
            }
         );
        });

        it('should resolve if successful', function (done) {
          data.deleteAll().then(function () {
            done();
          });
        });
      });
    });
  }
});
