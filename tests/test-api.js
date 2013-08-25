/*global chai:true, describe:true, it:true, before: true, beforeEach:true, after:true, afterEach:true, expect:true, should:true, sinon:true */
define(function () {
  describe('API Facade', function () {
    var server, handler, api;

    before(function (done) {
      require(['api'], function (rapi) {
        api = rapi;

        server = sinon.fakeServer.create();
        server.respondWith('/_R_/common/3/xhr/GetConfig.php', [200, { "Content-Type": "application/json", "Content-Length": 10 }, '{"_id": 1}']);
        server.respondWith('get', '/_R_/common/3/xhr/GetAnswer.php?asn=' + window.BMP.siteVars.answerSpace + '&iact=Exists&ajax=false', [200, { "Content-Type": "application/json", "Content-Length": 10 }, '{"_id": 1}']);
        server.respondWith('get', '/_R_/common/3/xhr/GetAnswer.php?asn=' + window.BMP.siteVars.answerSpace + '&iact=Exists&ajax=false&args[0]=Exists', [200, { "Content-Type": "application/json", "Content-Length": 10 }, '{"_id": 3}']);
        server.respondWith('post', '/_R_/common/3/xhr/GetAnswer.php?asn=' + window.BMP.siteVars.answerSpace + '&iact=Exists&ajax=false', [200, { "Content-Type": "application/json", "Content-Length": 10 }, '{"_id": 2}']);
        server.respondWith('/_R_/common/3/xhr/GetMoJO.php?_id=' + window.BMP.siteVars.answerSpaceId + '&_m=Exists&_lc=1', [200, { "Content-Type": "application/json", "Content-Length": 10 }, '{"_id": 1}']);
        server.respondWith('/_R_/common/3/xhr/GetForm.php?_v=3', [200, { "Content-Type": "application/json", "Content-Length": 10 }, '{"_id": 1}']);
        server.respondWith('post', '/_R_/common/3/xhr/SaveFormRecord.php?_asid=' + window.BMP.siteVars.answerSpaceId + '&_fn=Exists&_action=Exists', [200, { "Content-Type": "application/json", "Content-Length": 10 }, '{"_id": 1}']);

        $.ajaxPrefilter(function (options, originalOptions, jqXHR) {
          jqXHR.setRequestHeader('X-Blink-Config', JSON.stringify(window.BMP.siteVars));
        });

        handler = function (data, status, xhr) {
          should.exist(data);
          should.exist(xhr);
          should.exist(status);
          data.should.not.be.empty;
          status.should.be.string('success');
          xhr.should.be.an('object');
        };
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
          .done(handler)
          .done(function () {
            done();
          });
        server.respond();
      });
    });

    describe('getInteractionResult(iact, args, options)', function () {
      it('should GET a JSON definition from the server', function (done) {
        api.getInteractionResult('Exists', null)
          .done(handler)
          .done(function () {
            done();
          });
        server.respond();
      });

      it('should handle GET data passed in via args', function () {
        api.getInteractionResult('Exists', {
          0: "Exists"
        })
          .done(handler)
          .done(function (data, status, xhr) {
            data._id.should.equal(3);
          })
          .done(function () {
            done();
          });
        server.respond();
      });

      it('should handle POST data passed in via options param', function (done) {
        api.getInteractionResult('Exists', null, {
          type: "POST",
          data: {
            Exists: "Exists"
          }
        })
          .done(handler)
          .done(function (data, status, xhr) {
            data._id.should.equal(2);
          })
          .done(function () {
            done();
          });
        server.respond();
      });
    });

    describe('getDataSuitcase(suitcase, time)', function () {
      it('should GET a JSON definition from the server', function (done) {
        api.getDataSuitcase('Exists', '1')
          .done(handler)
          .done(function () {
            done();
          });
        server.respond();
      });
    });

    describe('getForm()', function () {
      it('should GET all form JSON definitions from the server', function (done) {
        api.getForm()
          .done(handler)
          .done(function () {
            done();
          });
        server.respond();
      });
    });

    describe('setPendingItem(form, action, data)', function () {
      it('should POST data to the server', function (done) {
        api.setPendingItem('Exists', 'Exists', {Exists: "Exists"})
          .done(handler)
          .done(function () {
            done();
          });
        server.respond();
      });
    });
  });
});
