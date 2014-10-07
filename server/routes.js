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
}
