/*eslint-env node*/

'use strict';

// Node.js built-ins

var fs = require('fs');
var path = require('path');

// 3rd-party modules

var Hapi = require('hapi');
var Mustache = require('mustache');

// this module

/*eslint-disable no-process-env*/ // not production code here, relax!
var BMP_HOST = process.env.BMP_HOST || 'blinkm.co';
/*eslint-disable no-process-env*/

var STATIC_PATHS = [
  '_c_', '_BICv3_', '_R_', '_W_', '_api', 'active_pages', 'admin', 'admintools', 'api_access', 'gfx', 'icons', 'livezone', 'tools', 'text3y'
];
var LOCAL_PATHS = [
  'node_modules', 'src', 'tests', 'vendor'
];

var pkg = require(path.join(__dirname, '..', '..', 'package.json'));

var server = new Hapi.Server();

server.connection({
  port: 9876
});

server.connection({
  port: 9877,
  tls: {
    key: fs.readFileSync('tests/support/key.pem'),
    cert: fs.readFileSync('tests/support/cert.pem')
  }
});

server.route({
  path: '/favicon.ico',
  method: 'GET',
  handler: {
    file: 'favicon.ico'
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
    contents += '\nCACHE:\n/_R_/common/3/xhr/GetConfig.php?_asn=' + request.query.answerSpace + '\n';
    reply(contents).header('Content-Type', 'text/cache-manifest');
  }
});

LOCAL_PATHS.forEach(function (s) {
  server.route({
    path: '/' + s + '/{param*}',
    method: 'GET',
    handler: {
      directory: {
        path: s + '/',
        listing: true,
        redirectToSlash: true
      }
    }
  });
});

STATIC_PATHS.forEach(function (s) {
  server.route({
    path: '/' + s + '/{param*}',
    method: ['GET', 'POST'],
    handler: {
      proxy: {
        host: BMP_HOST,
        port: 80,
        protocol: 'http',
        passThrough: true
      }
    }
  });
});

server.route({
  path: '/{param*}',
  method: 'GET',
  handler: function (request, reply) {
    var templatePath = path.join(__dirname, '..', '..', 'src', 'buildFiles', 'files', 'index.mustache');
    var contents = fs.readFileSync(templatePath, { encoding: 'utf8' });
    require('./template-data')(BMP_HOST, request, function (err, data) {
      if (err) { throw err; }
      contents = Mustache.render(contents, data);
      reply(contents).header('Content-Type', 'text/html')
        .header('X-BMP-Gap-Target', 'bmp-blinkgap-js')
        .header('X-BMP-Version', '3.xx.x');
    });
  }
});

server.start(function (err) {
  if (err) {
    console.log(err);
  }
});

module.exports = server;
