/*eslint-env node*/
'use strict';
var Hapi = require('hapi');
var fs = require('fs');

var server = new Hapi.Server();

server.connection({
  port: 9998
});

server.connection({
  port: 9997,
  tls: {
    key: fs.readFileSync('tests/support/key.pem'),
    cert: fs.readFileSync('tests/support/cert.pem')
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
    file: 'tests/support/index.html'
  }
});

server.route({
  path: '/integration/bic.js',
  method: 'GET',
  handler: {
    file: 'tests/support/bic.js'
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
