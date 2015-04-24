/*eslint-env node*/

'use strict';

// Node.js built-ins

var fs = require('fs');
var path = require('path');

// 3rd-party modules

var Hapi = require('hapi');
var Mustache = require('mustache');

// this module

var pkg = require(path.join(__dirname, '..', '..', 'package.json'));

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
  path: '/bic.js',
  method: 'GET',
  handler: {
    file: 'tests/support/bic.js'
  }
});

server.route({
  path: '/appcache.manifest',
  method: 'GET',
  handler: function (request, reply) {
    var templatePath = path.join(__dirname, '..', '..', 'src', 'buildFiles', 'templates', 'appcache.mustache');
    var contents = fs.readFileSync(templatePath, { encoding: 'utf8' });
    contents = Mustache.render(contents, {
      forms: pkg.formsversion
    });
    contents = contents.replace('/_c_/blink/bic/{{id}}/bic.min.js\n', '');
    contents = contents.replace('/_c_/blink/bic/{{id}}/bic.js', '/bic.js');
    contents = contents.replace(/^\/_c_\//mg, '//d1c6dfkb81l78v.cloudfront.net/');
    contents += '\nCACHE:\n/_R_/common/3/xhr/GetConfig.php?_asn=integration\n';
    reply(contents).header('Content-Type', 'text/cache-manifest');
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
  handler: function (request, reply) {
    var templatePath = path.join(__dirname, '..', '..', 'src', 'buildFiles', 'files', 'index.mustache');
    var contents = fs.readFileSync(templatePath, { encoding: 'utf8' });
    require('./template-data')(request, function (err, data) {
      if (err) { throw err; }
      contents = Mustache.render(contents, data);
      reply(contents).header('Content-Type', 'text/html');
    });
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
