module.exports = function (server) {
  server.route({
    path: '/{param*}',
    method: 'GET',
    handler: {
      directory: {
        path: './',
        listing: true,
      }
    }
  });

  server.route({
    path: '/integration/{param*}',
    method: 'GET',
    handler: {
      file: './integration/index.html'
    }
  });

  server.route({
    path: '/integration/loader.js',
    method: 'GET',
    handler: {
      file: './integration/loader.js'
    }
  });

  server.route({
    path: '/_R_/common/3/util/GetCacheManifest.php',
    method: 'GET',
    handler: {
      file: './integration/cache.manifest'
    }
  });

  server.route({
    path: '/_R_/common/3/xhr/GetConfig.php',
    method: 'GET',
    handler: {
      file: './integration/config.json'
    }
  });

  server.route({
    path: '/_R_/common/3/xhr/GetForm.php',
    method: 'GET',
    handler: {
      file: './integration/getform.json'
    }
  });

  server.route({
    path: '/_R_/common/3/xhr/GetMoJO.php',
    method: 'GET',
    handler: {
      file: './integration/mojo.xml'
    }
  });

  server.route({
    path: '/_R_/common/3/xhr/GetFormList.php',
    method: 'GET',
    handler: {
      file: './integration/formList.xml'
    }
  });

  server.route({
    path: '/_R_/common/3/xhr/GetFormRecord.php',
    method: 'GET',
    handler: {
      file: './integration/formRecord.xml'
    }
  });

  server.route({
    path: '/_R_/common/3/xhr/SaveFormRecord.php',
    method: 'POST',
    handler: function (request, reply) {
      // Valid Response
      reply('<div>Way to go, sport!</div>');

      // Failed Validation
      //var response = reply({"message":"<span class=\"bForm-error\">Form could not be submitted.<\/span>","errors":{"text_box":"Text Box\/ cannot be more then 5 characters"}}).hold();
      //response.code(470);
      //response.send();
    }
  });

  server.route({
    path: '/scripts/uuid.js',
    method: 'GET',
    handler: {
      file: './bower_components/node-uuid/uuid.js'
    }
  });

  server.route({
    path: '/_R_/common/3/xhr/GetAnswer.php',
    method: 'GET',
    handler: function (request, reply) {
      if (request.query.iact === 'set_datasuitcase') {
        reply('<?xml version="1.0" encoding="UTF-8" ?><xml><test>Integration</test></xml>');
      } else {
        reply('MADL Code Interaction');
      }
    }
  });
}
