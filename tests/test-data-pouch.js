define(['Squire', 'pouchdb'], function (Squire, Pouch) {
  describe('Data Abstraction Layer - PouchDB', function () {
    var server, Data, data, model, dbAdapter;

    before(function (done) {
      var injector = new Squire();

      model = {
        toJSON: function () {
          return {cat: 'hat'};
        }
      };

      injector.require(['../scripts/data-pouch'], function (required) {
        Data = required;
        done();
      });
    });

    beforeEach(function (done) {
      data = new Data('unitTests');
      dbAdapter = data.dbAdapter;
      done();
    });

    afterEach(function (done) {
      // Seems odd to be doing an insert before we wipe the db, no?
      // Well listen up kiddo!
      // This ensures that the DB actually exists
      // Or all hell breaks loose in the land of DOMException
      // Where wilderbeats roam free
      // And the dread lord DOM walks the land
      data.dbAdapter = dbAdapter;
      data.create(model).then(function (doc) {
        data.deleteAll().then(
          function () {
            done();
          },
          function (err) {
            console.log(err);
            done();
          }
        );
      });
    });

    it('should be a constructor', function () {
      expect(Data).to.be.a('function');
      // Just assume that beforeEach has handled this
      // Or you are in a world of pain
      expect(data).to.be.an('object');
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
          expect(db).to.exist;
          expect(db).to.be.an('object');
          expect(db).to.have.property('get');
          expect(db).to.have.property('post');
          expect(db).to.have.property('put');
          expect(db).to.have.property('allDocs');
          expect(db).to.have.property('remove');
          done();
        });
      });

      //it('should reject if a db cannot be created');
      it('should reject if a db cannot be created', function (done) {
        data.dbAdapter = function () {return 'iwgiapugpi://'};
        data.getDB().then(null, function (err) {
          expect(err).to.exist;
          done();
        });
      });
    });

    describe('#dbAdapter', function () {
      it('should be a function', function () {
        expect(data.dbAdapter).to.be.a('function');
      });

      it('should return an indexeddb connection string when available', function () {
        if (window.indexedDB) {
          expect(data.dbAdapter()).to.match(/idb:\/\//)
        }
      });

      it('should return a websql connection string when inside isBlinkGap', function () {
        window.BMP.isBlinkGap = true;
        expect(data.dbAdapter()).to.match(/websql:\/\//)
        window.BMP.isBlinkGap = false;
      });

      it('should return false when indexeddb is not supported and not inside phonegap', function () {
        if (!window.indexedDB || window.indexedDB.open('idbTest', 1).onupgradeneeded !== null) {
          expect(data.dbAdapter()).to.be.false;
        }
      });
    });

    describe('#create', function () {
      it('should be a function', function () {
        expect(data.create).to.be.a('function');
      });

      it('should return an XHR compatible promise', function () {
        expect(data.create({})).to.be.instanceOf(Promise);
      });

      it('should resolve with the newly created object', function (done) {
        data.create(model).then(function (doc) {
          expect(doc).to.exist;
          expect(doc._id).to.exist;
          expect(doc.cat).to.equal('hat');
          done();
        });
      });

      it('should create an object in the database', function (done) {
        data.getDB().then(function (db) {
          db.allDocs(function (err, response) {
            expect(err).to.not.exist;
            expect(response).to.exist;
            expect(response).to.be.an('object');
            expect(response.total_rows).to.equal(0);
            data.create(model).then(function (model) {
              db.allDocs(function (err, response) {
                expect(err).to.not.exist;
                expect(response).to.be.an('object');
                expect(response.total_rows).to.equal(1);
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
        expect(data.update({})).to.be.instanceOf(Promise);
      });

      it('should resolve with the updated object', function (done) {
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
          }
          data.update(createdModel).then(function (updatedModel) {
            expect(updatedModel).to.exist;
            expect(updatedModel).to.have.property('hat', 'cat');
            done();
          });
        })
      });

      it('should update the object in the database', function (done) {
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
          }
          data.update(createdModel).then(function () {
            data.getDB().then(function (db) {
              db.get(createdModel._id, function (err, doc) {
                expect(err).to.not.exist;
                expect(doc).to.exist;
                expect(doc).to.have.property('hat', 'cat');
                done();
              })
            });
          });
        });
      });

      it('should reject if the _id field is not present', function (done) {
        data.update(model).then(null, function (err) {
          done();
        });
      });

      it('should reject if the item could not be updated', function (done) {
        data.create(model).then(function (createdModel) {
          createdModel.id = createdModel._id;
          createdModel.toJSON = function () {
            return {
              _id: createdModel._id,
              _rev: 0,
              cat: createdModel.cat,
              hat: 'cat'
            };
          }
          data.update(createdModel).then(null, function (err) {
            expect(err).to.exist;
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
        expect(data.read({})).to.be.instanceOf(Promise);
      });

      it('should resolve with the object from the db', function (done) {
        data.create(model).then(function (createdModel) {
          data.read({id: createdModel._id}).then(function (doc) {
            expect(doc).to.exist;
            expect(doc).to.have.property('cat', 'hat');
            done();
          });
        });
      });

      it('should reject if the object could not be retreived', function (done) {
        data.read({id: 1}).then(null, function (err) {
          expect(err).to.exist;
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
        data.readAll().then(function (docs) {
          expect(docs).to.exist;
          expect(docs).to.be.an('array');
          expect(docs).to.have.property('length', 0);
          data.create(model).then(function (createdModel) {
            data.readAll().then(function (docs) {
              expect(docs).to.exist;
              expect(docs).to.be.an('array');
              expect(docs).to.have.property('length', 1);
              expect(docs[0]).to.have.property('cat', 'hat');
              done();
            });
          });
        });
      });

      it('should reject with', function (done) {
        data.dbAdapter = function () {return 'iwgiapugpi://'};
        data.readAll().then(null, function (err) {
          expect(err).to.exist;
          done();
        });
      });
    });

    describe('#delete', function () {
      it('should be a function', function () {
        expect(data.delete).to.be.a('function');
      });

      it('should return an XHR compatible promise', function () {
        expect(data.delete({})).to.be.instanceOf(Promise);
      });

      it('should resolve with deletion confirmation', function (done) {
        data.create(model).then(function (createdModel) {
          data.delete({id: createdModel._id}).then(function (doc) {
            expect(doc).to.exist;
            expect(doc).to.have.property('ok', true);
            data.readAll().then(function (docs) {
              expect(docs).to.exist;
              expect(docs).to.have.property('length', 0);
              done();
            });
          });
        });
      });

      it('should reject with any errors encountered', function (done) {
        data.delete({id: 1}).then(null, function (err) {
          expect(err).to.exist;
          done();
        });
      });
    });

    describe('#deleteAll', function () {
      it('should be a function', function () {
        expect(data.deleteAll).to.be.a('function');
      });

      it('should return an XHR compatible promise', function () {
        expect(data.deleteAll()).to.be.instanceOf(Promise);
      });

      it('should resolve if successful', function (done) {
        data.deleteAll().then(function () {
          done();
        });
      });

      it('should reject with an error if it fails', function (done) {
        data.dbAdapter = function () {return 'iwgiapugpi://'};
        data.deleteAll().then(null, function (err) {
          expect(err).to.exist;
          done();
        });
      });
    });
  });
});

