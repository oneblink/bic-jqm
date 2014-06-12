Hapi = require('hapi');
var server = new Hapi.Server('localhost', 9998);

server.route({
  path: '/{param*}',
  method: 'GET',
  handler: {
    directory: {
      path: './',
      listing: true,
      redirectToSlash: false
    }
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
    file: './integration/mojo.json'
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

server.start(function () {
  console.log('Server started at: ' + server.info.uri);
});

module.exports = server;
