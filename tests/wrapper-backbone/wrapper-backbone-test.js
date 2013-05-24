/*global chai:true, describe:true, it:true, before: true, beforeEach:true, after:true, afterEach:true, expect:true, should:true, sinon:true */

define('data-pouch', [], function () {
  "use strict";
  return function () {};
});

define(['../../scripts/wrapper-backbone.js', 'jquery', 'underscore'],
  function (Backbone, $, _) {
    "use strict";
    describe('Wrapper - Backbone', function () {
      
      it("should exist", function () {
        should.exist(Backbone);
      });

      it("should return Backbone", function (done) {
        require(['backbone'], function (bb) {
          Backbone.should.equal(bb);
          done();
        });
      });

      describe("Backbone.sync(method, model, options)", function () {
        it("should overwrite Backbone.sync to dynamically choose the correct sync method", function () {
          var spy = sinon.spy(),
            stub = sinon.stub(Backbone, "getSyncMethod", function () {
              return spy;
            });
          Backbone.sync(null, {}, {});
          stub.called.should.be.true;
          spy.called.should.be.true;
          Backbone.getSyncMethod.restore();
        });
      });

      describe("Backbone.getSyncMethod(model)", function () {
        it("should exist", function () {
          should.exist(Backbone.getSyncMethod);
        });

        it("should return the correct sync method", function () {
          var spy, ajax, data;
          spy = sinon.spy();
          ajax = sinon.stub(Backbone, "ajaxSync", function () {return spy;});
          data = sinon.stub(Backbone, "dataSync", function () {return spy;});

          ajax.called.should.be.false;
          Backbone.getSyncMethod({}).apply();
          ajax.called.should.be.true;

          data.called.should.be.false;
          Backbone.getSyncMethod({data: true}).apply();
          data.called.should.be.true;

          Backbone.ajaxSync.restore();
          Backbone.dataSync.restore();
        });
      });

      describe("Backbone.ajaxSync(method, model, options)", function () {
        it("should preserve Backbone's built in sync method", function () {
          try {
            Backbone.ajaxSync({});
          }
          catch (e) {
            e.should.be.instanceof(Error);
          }
        });
      });

      describe("Backbone.dataSync(method, model, options)", function () {
        it("should exist", function () {
          should.exist(Backbone.dataSync);
        });

        it("should do nothing when offline");

        it("should provide bindings to the data abstraction layer", function () {
          var model = new Backbone.Model(),
            data = {
                read: function () {return $.Deferred().promise();},
                readAll: function () {return $.Deferred().promise();},
                create: function () {return $.Deferred().promise();},
                update: function () {return $.Deferred().promise();},
                delete: function () {return $.Deferred().promise();}
              },
            spy,
            tests;
          model.data = data;
          model.id = 1;

          tests = ["read", "read", "create", "update", "patch", "delete"];
          _.each(tests, function (element, index, list) {
            if (!model.id && element === "read") {
              spy = sinon.spy(data, "readAll");
            } else if (element === "patch") {
              spy = sinon.spy(data, "update");
            } else {
              spy = sinon.spy(data, element);
            }
            spy.called.should.be.false;
            Backbone.dataSync(element, model);
            spy.called.should.be.true;

            if (!model.id && element === "read") {
              data["readAll"].restore();
              delete model.id;
            } else if (element === "patch") {
              data.update.restore();
            } else {
              data[element].restore();
            }
          });
        });

        it("should trigger a request event on the model", function (done) {
          var model = new Backbone.Model();

          model.data = {readAll: function () {return $.Deferred().promise();}};

          model.once("request", function (model, promise, options) {
            done();
          });

          Backbone.dataSync("read", model, {});
        });

        it("should return a promise", function (done) {
          var model = new Backbone.Model();
          model.data = {readAll: function () {return $.Deferred().resolve().promise();}};
          Backbone.dataSync("read", model, {}).done(function () {
            done();
          });
        });
      });
    });
  });
