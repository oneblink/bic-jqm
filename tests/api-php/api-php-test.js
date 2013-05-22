/*global chai:true, describe:true, it:true, before: true, beforeEach:true, after:true, afterEach:true, expect:true, should:true, sinon:true */
window.BMP = {
  siteVars: {
    answerSpace: 'Exists',
    answerSpaceId: 1
  }
};

define(['../../scripts/api-php.js'],
  function (api) {
    "use strict";
    describe('API Facade Layer - PHP Implementation', function () {
      var server;

      before(function () {
        server = sinon.fakeServer.create();
        server.respondWith('/_R_/common/3/xhr/GetConfig.php', [200, { "Content-Type": "application/json", "Content-Length": 10 }, '{"_id": 1}']);
        server.respondWith('/_R_/common/3/xhr/GetAnswer.php?asn=' + window.BMP.siteVars.answerSpace + '&iact=Exists&ajax=false', [200, { "Content-Type": "application/json", "Content-Length": 10 }, '{"_id": 1}']);
        server.respondWith('/_R_/common/3/xhr/GetMoJO.php?_id=' + window.BMP.siteVars.answerSpaceId + '&_m=Exists&_lc=1', [200, { "Content-Type": "application/json", "Content-Length": 10 }, '{"_id": 1}']);
        server.respondWith('/_BICv3_/xhr/GetForm.php?asn=' + window.BMP.siteVars.answerSpace + '&form=Exists', [200, { "Content-Type": "application/json", "Content-Length": 10 }, '{"_id": 1}']);

        $.ajaxPrefilter(function (options, originalOptions, jqXHR) {
          jqXHR.setRequestHeader('X-Blink-Config', JSON.stringify(window.BMP.siteVars));
        });
      });

      after(function () {
        server.restore();
      });

      it('should be an object', function () {
        expect(api).to.be.an('object');
      });

      describe('getAnswerSpaceMap()', function () {
        it('should GET a JSON definition from the server', function (done) {
          api.getAnswerSpaceMap()
            .done(function (data, status, xhr) {
              expect(data).to.be.an('object');
              expect(xhr).to.be.an('object');
              expect(status).to.be.string('success');
              done();
            });
          server.respond();
        });
        it('should crash and burn if the params are wrong');
      });

      describe('getInteractionResult(iact, options)', function () {
        it('should GET a JSON definition from the server', function (done) {
          api.getInteractionResult('Exists', 'Exists')
            .done(function (data, status, xhr) {
              expect(data).to.be.an('object');
              expect(xhr).to.be.an('object');
              expect(status).to.be.string('success');
              done();
            });
          server.respond();
        });
        it('should handle GET data passed in via args');
        it('should handle POST data passed in via options param');
      });

      describe('getDataSuitcase', function () {
        it('should GET a JSON definition from the server', function (done) {
          api.getDataSuitcase('Exists', '1')
            .done(function (data, status, xhr) {
              expect(data).to.be.an('string');
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

      describe('setPendingItem', function () {
        it('should POST a JSON definition to the server');
        it('should crash and burn if the params are wrong');
      });
    });
  });
