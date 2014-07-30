var Hapi = require('hapi');
var fs = require('fs');

var server = new Hapi.Server('0.0.0.0', 9997, {
  tls: {
    key: fs.readFileSync('server/key.pem'),
    cert: fs.readFileSync('server/cert.pem')
  }
});

require('./routes.js')(server);

server.start(function () {
  console.log('Server started at: ' + server.info.uri);
});

module.exports = server;
