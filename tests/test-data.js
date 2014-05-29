define(['Squire', 'feature!promises'], function (Squire, Promise) {
  "use strict";

  var injector;

  if (!window.Promise) {
    window.Promise = Promise;
  }

  before(function (done) {
    injector = new Squire();
    done();
  });

  describe('Data Abstraction Layer', function () {

    ['data-pouch'].forEach(function (adapter) {

      describe('adapter=' + adapter, function () {

        var Data, data, Model, id;

        before(function (done) {
          injector.require([adapter, 'model-pending'], function (klass, model) {
            Data = klass;
            Model = model;
            done();
          });
        });

        describe('module export: Data', function () {

          it('should be a function', function () {
            Data.should.be.an.instanceof(Function);
          });

        });

        describe('data = new Data("test")', function () {

          before(function () {
            data = new Data('test');
          });

          it("should create a new instance of the Data layer", function () {
            expect(data).to.be.an.instanceof(Data);
          });

          it("should namespace all DB's with name", function () {
            expect(data.name).to.equal('test');
          });
        });

        if (adapter === 'data-pouch') {

          describe('data.dbAdapter()', function () {
            it("should detect if in native app and use websql");

            it("should detect if indexeddb is available and use it");

            it("should return false if no indexeddb and not native");
          });

        }

        describe('data.create(model)', function () {
          var promise;

          it("should generate an ID for the model", function (done) {
            var model;
            model = new Model({ abc: 123 });
            expect(model.get('_id')).to.not.exist;
            promise = data.create(model);
            promise.then(function (result) {
              id = result._id;
              expect(result._id).to.exist;
              expect(result.abc).to.equal(123);
              done();
            });
          });

          it("should create model in the DB");

          it("should resolve the model");

          it("should throw error at the slightest problem");

          it("should return a promise", function () {
            expect(promise).to.be.an.instanceof(Promise);
          });
        });

        describe('data.read(model)', function (done) {
          var promise;

          it("should find and resolve model", function (done) {
            var model;
            model = new Model({ _id: id });
            promise = data.read(model);
            promise.then(function (result) {
              expect(result.abc).to.equal(123);
              done();
            });
          });

          it("should throw error at the slightest problem");

          it("should return a promise", function () {
            expect(promise).to.be.an.instanceof(Promise);
          });
        });

        describe('readAll()', function () {
          var promise;

          before(function (done) {
            data.create(new Model({ def: 456 })).then(function () {
              done();
            });
          });

          it("should find and resolve all models in db", function (done) {
            promise = data.readAll().then(function (results) {
              results.should.be.an.instanceof(Array);
              expect(results.length).to.equal(2);
              expect(results.some(function (result) {
                return result.abc === 123;
              })).to.be.true;
              expect(results.some(function (result) {
                return result.def === 456;
              })).to.be.true;
              done();
            });
          });

          it("should throw error at the slightest problem");

          it("should return a promise", function () {
            expect(promise).to.be.an.instanceof(Promise);
          });
        });

        describe('data.update(model)', function () {
          var promise;

          if (adapter === 'data-pouch') {

            it("should create model in the DB if given ID");

            it("should update model in the DB if given ID and REV", function (done) {
              data.read(new Model({ _id: id })).then(function (result) {
                promise = data.update(new Model({
                  _id: id,
                  _rev: result._rev,
                  abc: 789
                }));
                promise.then(function () {
                  data.read(new Model({ _id: id })).then(function (result) {
                    expect(result.abc).to.equal(789);
                    done();
                  });
                });
              });
            });

          } else {

            it("should update model from db", function (done) {
              promise = data.update(new Model({ _id: id, abc: 789 }));
              promise.then(function () {
                data.read({ _id: id }).then(function (result) {
                  expect(result.abc).to.equal(789);
                  done();
                });
              });
            });

          }

          it("should resolve the model");

          it("should throw error at the slightest problem");

          it("should return a promise", function () {
            expect(promise).to.be.an.instanceof(Promise);
          });
        });

        describe('data.delete(model)', function () {
          var promise;

          it("should delete model from db", function (done) {
            promise = data.delete(new Model({ _id: id }));
            promise.then(function (results) {
              data.readAll().then(function (results) {
                var result;
                results.should.be.an.instanceof(Array);
                expect(results.length).to.equal(1);
                result = results[0];
                expect(result.abc).to.not.exist;
                expect(result.def).to.equal(456);
                done();
              });
            });
          });

          it("should throw error at the slightest problem");

          it("should return a promise", function () {
            expect(promise).to.be.an.instanceof(Promise);
          });
        });

        describe('deleteAll(model)', function () {
          var promise;

          it("should destroy the DB", function (done) {
            promise = data.deleteAll();
            promise.then(function () {
              done();
            });
          });

          it("should throw error at the slightest problem");

          it("should return a promise", function () {
            expect(promise).to.be.an.instanceof(Promise);
          });
        });
      });

    });

  });

});
