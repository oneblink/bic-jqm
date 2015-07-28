define(['Squire', 'sinon', 'jquery'], function (Squire, sinon, $) {
  'use strict';
  describe('API Facade', function () {
    var server, handler, api;

    before(function (done) {
      var injector = new Squire();
      injector.mock('uuid', {
        v4: function () { return 12345; }
      });

      injector.require(['bic/api-web'], function (required) {
        api = required;

        server = sinon.fakeServer.create();

        server.respondWith('/_R_/common/3/xhr/GetConfig.php?_asn=' + window.BMP.BIC.siteVars.answerSpace.toLowerCase(), [200, { 'Content-Type': 'application/json', 'Content-Length': 10 }, '{"_id": 1}']);

        server.respondWith('get', '/_R_/common/3/xhr/GetAnswer.php?asn=' + window.BMP.BIC.siteVars.answerSpace.toLowerCase() + '&iact=Exists&ajax=false', [200, { 'Content-Type': 'application/json', 'Content-Length': 10 }, '{"_id": 1}']);
        server.respondWith('get', '/_R_/common/3/xhr/GetAnswer.php?asn=' + window.BMP.BIC.siteVars.answerSpace.toLowerCase() + '&iact=Exists&ajax=false&0=Exists', [200, { 'Content-Type': 'application/json', 'Content-Length': 10 }, '{"_id": 3}']);
        server.respondWith('post', '/_R_/common/3/xhr/GetAnswer.php?asn=' + window.BMP.BIC.siteVars.answerSpace.toLowerCase() + '&iact=Exists&ajax=false', [200, { 'Content-Type': 'application/json', 'Content-Length': 10 }, '{"_id": 2}']);

        server.respondWith('/_R_/common/3/xhr/GetMoJO.php?_id=' + window.BMP.BIC.siteVars.answerSpaceId + '&_m=Exists', [200, { 'Content-Type': 'application/json', 'Content-Length': 10 }, '{"_id": 1}']);

        server.respondWith('/_R_/common/3/xhr/GetForm.php?_v=3&_aid=' + window.BMP.BIC.siteVars.answerSpaceId, [200, { 'Content-Type': 'application/json', 'Content-Length': 10 }, '{"_id": 1}']);

        server.respondWith('post', '/_R_/common/3/xhr/SaveFormRecord.php?schema=3&_asid=' + window.BMP.BIC.siteVars.answerSpaceId + '&_fn=Exists&_action=Exists', [200, { 'Content-Type': 'application/json', 'Content-Length': 10 }, '{"_id": 1}']);

        server.autoRespond = true;

        $.ajaxPrefilter(function (options, originalOptions, jqXHR) {
          jqXHR.setRequestHeader('X-Blink-Config', JSON.stringify(window.BMP.BIC.siteVars));
        });

        handler = function (data, status, xhr) {
          expect(data).to.not.equal(null).and.not.equal(undefined);
          expect(xhr).to.not.equal(null).and.not.equal(undefined);
          expect(status).to.not.equal(null).and.not.equal(undefined);
          expect(data.length).to.not.equal(0);
          status.should.be.string('success');
          xhr.should.be.an('object');
          return data;
        };
        done();
      }, function () {
        done();
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
          .then(handler)
          .then(function () {
            done();
          });
      });
    });

    describe('getInteractionResult(iact, args, options)', function () {
      it('should GET a JSON definition from the server', function (done) {
        api.getInteractionResult('Exists', null)
          .then(handler)
          .then(function () {
            done();
          });
      });

      it('should handle GET data passed in via args', function (done) {
        api.getInteractionResult('Exists', {
          0: 'Exists'
        })
          .then(handler)
          .then(function (data) {
            data._id.should.equal(3);
          })
          .then(function () {
            done();
          });
      });

      it('should handle POST data passed in via options param', function (done) {
        api.getInteractionResult('Exists', null, {
          type: 'POST',
          data: {
            Exists: 'Exists'
          }
        })
          .then(handler)
          .then(function (data) {
            data._id.should.equal(2);
          })
          .then(function () {
            done();
          });
      });
    });

    describe('getDataSuitcase(suitcase, time)', function () {
      it('should GET a JSON definition from the server', function (done) {
        api.getDataSuitcase('Exists', '1')
          .then(handler)
          .then(function () {
            done();
          });
      });
    });

    describe('getForm()', function () {
      it('should GET all form JSON definitions from the server', function (done) {
        api.getForm()
          .then(function () {
            done();
          });
      });
    });

    describe('setPendingItem(form, action, data)', function () {
      it('should POST data to the server', function (done) {
        api.setPendingItem('Exists', 'Exists', {Exists: 'Exists'})
          .then(handler)
          .then(function () {
            done();
          });
      });
    });
  });
});
