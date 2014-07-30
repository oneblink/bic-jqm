Hapi = require('hapi');
var server = new Hapi.Server('0.0.0.0', 9998);

require('./routes.js')(server);

server.start(function () {
  console.log('Server started at: ' + server.info.uri);
});

module.exports = server;
