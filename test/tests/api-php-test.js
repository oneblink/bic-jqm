/*global chai:true, describe:true, it:true, before: true, beforeEach:true, after:true, afterEach:true, expect:true, should:true, sinon:true */

define([ '../scripts/api-php.js'],
  function (api) {
    "use strict";
    describe('API Facade Layer - PHP Implementation', function () {
      var server;

      before(function () {
        server = sinon.fakeServer.create();
        server.respondWith('/_BICv3_/xhr/GetApp.php?asn=Exists', [200, { "Content-Type": "application/json", "Content-Length": 10 }, '{"_id": 1}']);
        server.respondWith('/_BICv3_/xhr/GetInteraction.php?asn=Exists&iact=Exists', [200, { "Content-Type": "application/json", "Content-Length": 10 }, '{"_id": 1}']);
        server.respondWith('/_BICv3_/xhr/GetInteraction.php?asn=Exists&iact=Exists&args[0]=Exists', [200, { "Content-Type": "application/json", "Content-Length": 10 }, '{"_id": 1}']);
        server.respondWith('/_BICv3_/xhr/GetDataSuitcase.php?asn=Exists&ds=Exists', [200, { "Content-Type": "application/json", "Content-Length": 10 }, '{"_id": 1}']);
        server.respondWith('/_BICv3_/xhr/GetForm.php?asn=Exists&form=Exists', [200, { "Content-Type": "application/json", "Content-Length": 10 }, '{"_id": 1}']);
        
      });

      after(function () {
        server.restore();
      });

      it('should be an object', function () {
        expect(api).to.be.an('object');
      });

      describe('getAnswerSpace', function () {
        it('should GET a JSON definition from the server', function (done) {
          api.getAnswerSpace('Exists')
            .done(function (data, status, xhr) {
              expect(data).to.be.an('object');
              expect(xhr).to.be.an('object');
              expect(status).to.be.string('success');
              done();
            });
          server.respond();
        });
        it('should crash and burn if the params are wrong', function (done) {
          api.getAnswerSpace('NotExists')
            .fail(function (xhr, status, error) {
              expect(xhr).to.be.an('object');
              expect(status).to.be.string('error');
              expect(error).to.be.string('Not Found');
              done();
            });
          server.respond();
        });
      });

      describe('getInteraction', function () {
        it('should GET a JSON definition from the server', function (done) {
          api.getInteraction('Exists', 'Exists')
            .done(function (data, status, xhr) {
              expect(data).to.be.an('object');
              expect(xhr).to.be.an('object');
              expect(status).to.be.string('success');
              done();
            });
          server.respond();
        });
        it('should crash and burn if the params are wrong', function (done) {
          api.getInteraction('NotExists')
            .fail(function (xhr, status, error) {
              expect(xhr).to.be.an('object');
              expect(status).to.be.string('error');
              expect(error).to.be.string('Not Found');
              done();
            });
          server.respond();
        });
      });

      describe('getDataSuitcase', function () {
        it('should GET a JSON definition from the server', function (done) {
          api.getDataSuitcase('Exists', 'Exists')
            .done(function (data, status, xhr) {
              expect(data).to.be.an('object');
              expect(xhr).to.be.an('object');
              expect(status).to.be.string('success');
              done();
            });
          server.respond();
        });
        it('should crash and burn if the params are wrong', function (done) {
          api.getDataSuitcase('NotExists')
            .fail(function (xhr, status, error) {
              expect(xhr).to.be.an('object');
              expect(status).to.be.string('error');
              expect(error).to.be.string('Not Found');
              done();
            });
          server.respond();
        });
      });

      describe('getForm', function () {
        it('should GET a JSON definition from the server', function (done) {
          api.getForm('Exists', 'Exists')
            .done(function (data, status, xhr) {
              expect(data).to.be.an('object');
              expect(xhr).to.be.an('object');
              expect(status).to.be.string('success');
              done();
            });
          server.respond();
        });
        it('should crash and burn if the params are wrong', function (done) {
          api.getForm('NotExists')
            .fail(function (xhr, status, error) {
              expect(xhr).to.be.an('object');
              expect(status).to.be.string('error');
              expect(error).to.be.string('Not Found');
              done();
            });
          server.respond();
        });
      });
    });
  });
