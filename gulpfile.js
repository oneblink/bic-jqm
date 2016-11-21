/* eslint-disable global-strict, node/no-unpublished-require */
'use strict';

// 3rd-party modules

var gulp = require('gulp');

// this module

gulp.task('test', [], function () {
  require('./tests/commonjs/');
});

gulp.task('default', ['test'], function () {});
