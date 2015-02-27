/*eslint-env node*/
var Hapi = require('hapi');
var fs = require('fs');

var server = new Hapi.Server();

server.connection({
  port: 9998
});

server.connection({
  port: 9997,
  tls: {
    key: fs.readFileSync('server/key.pem'),
    cert: fs.readFileSync('server/cert.pem')
  }
});

server.route({
  path: '/{param*}',
  method: 'GET',
  handler: {
    directory: {
      path: './',
      listing: true
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
  path: '/integration/bic.js',
  method: 'GET',
  handler: {
    file: './integration/bic.js'
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
  path: '/_R_/{param*}',
  method: ['GET', 'POST'],
  handler: {
    proxy: {
      host: 'blinkm.co',
      port: 80,
      protocol: 'http',
      passThrough: true
    }
  }
});

server.route({
  path: '/_c_/{param*}',
  method: ['GET', 'POST'],
  handler: {
    proxy: {
      host: 'blinkm.co',
      port: 80,
      protocol: 'http',
      passThrough: true
    }
  }
});

server.start(function (err) {
  if (err) {
    console.log(err);
  }
});

module.exports = server;
