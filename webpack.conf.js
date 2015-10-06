'use strict';

// Node.js built-ins

var path = require('path');

// foreign modules

var webpack = require('webpack');

// this module

module.exports = {
  // bail: true,
  context: path.join(__dirname, 'src'),
  entry: ['./bic.js'],
  externals: [
    'BlinkForms',
    'BMP.Blobs',
    'backbone',
    'bluebird',
    'es5-shim',
    'jquery',
    'jquerymobile',
    'modernizr',
    'mustache',
    'pouchdb',
    'signaturepad',
    'underscore',
    {
      /* */
    }
  ],
  module: {
    loaders: [
      {
        test: /\.jsx?$/,
        loader: 'babel'
      }
    ]
  },
  node: {
    crypto: 'empty' // optional dep for sjcl, adds 110KB to pre-minify size
  },
  output: {
    filename: 'bic.js',
    library: 'bic/main',
    libraryTarget: 'umd',
    path: path.join(__dirname, 'build'),
    umdNamedDefine: true
  },
  plugins: [
    new webpack.optimize.DedupePlugin(),
    new webpack.optimize.MinChunkSizePlugin({ minChunkSize: 1e6 }),
    new webpack.optimize.OccurenceOrderPlugin()
  ],
  resolve: {
    alias: {
      authentication: 'offlineLogin',
      bic: path.join(__dirname, 'src', 'bic'),
      'typed-errors': 'js-typed-errors',
      uuid: 'node-uuid'
    }
  }
};
