/* eslint-env node */
/* eslint-disable no-console */
'use strict';

var pkg = require('./package.json');
var version = pkg.version;
var forms = pkg.formsversion;
var now = new Date();

var uglifyConfig = {
  files: {}
};

console.log(version, forms);

uglifyConfig.files['dist/' + now.valueOf() + '/bic.min.js'] = ['dist/' + now.valueOf() + '/bic.js'];

module.exports = function (grunt) {
  grunt.initConfig({

    concurrent: {
      background: ['hapi:http', 'watch'],
      options: {
        logConcurrentOutput: true
      }
    },

    hapi: {
      test: {
        options: {
          server: require('path').resolve('tests/support/server.js'),
          bases: {},
          noasync: false
        }
      },
      http: {
        options: {
          server: require('path').resolve('tests/support/server.js'),
          bases: {},
          noasync: true
        }
      }
    },

    watch: {
      src: {
        files: ['src/**/**', 'tests/**/**'],
        tasks: ['build', 'eslint', 'karma:phantom']
      }
    },

    eslint: {
      target: [ './' ]
    },

    karma: {
      auto: {
        configFile: 'karma.conf.js'
      },
      phantom: {
        configFile: 'karma.conf.js',
        browsers: ['PhantomJS'],
        frameworks: ['mocha', 'requirejs'] // no detectBrowsers
      }
    },

    requirejs: {
      compile: {
        options: {
          baseUrl: 'src',
          name: 'bic',
          include: ['bic/form-expressions', 'bic/router'],
          insertRequire: ['bic/form-expressions', 'bic'],
          out: 'build/bic.js',
          optimize: 'none',
          map: {
            '*': {
              // 'bic': 'main'
            }
          },
          paths: {
            feature: '../node_modules/amd-feature/feature',
            pollUntil: '../node_modules/poll-until/poll-until',
            BlinkGap: '../node_modules/blinkgap-utils/BMP.BlinkGap',
            '@blinkmobile/geolocation': '../node_modules/@blinkmobile/geolocation/geolocation',
            'is-indexeddb-reliable': '../node_modules/is-indexeddb-reliable/dist/index',
            '@jokeyrhyme/deadline': '../node_modules/@jokeyrhyme/deadline/dist/index',
            '@jokeyrhyme/promised-requirejs': '../node_modules/@jokeyrhyme/promised-requirejs/dist/index',
            text: '../node_modules/text/text',
            domReady: '../node_modules/domReady/domReady',
            uuid: '../node_modules/node-uuid/uuid',
            authentication: '../node_modules/offlineLogin/authentication',
            sjcl: '../node_modules/sjcl/sjcl',
            /* at runtime, retrieve these from the CDN separately (don't bundle them) */
            BlinkForms: 'empty:',
            'BMP.Blobs': 'empty:',
            backbone: 'empty:',
            bluebird: 'empty:',
            'es5-shim': 'empty:',
            jquery: 'empty:',
            jquerymobile: 'empty:',
            modernizr: 'empty:',
            mustache: 'empty:',
            pouchdb: 'empty:',
            signaturepad: 'empty:',
            underscore: 'empty:'
          },
          shim: {
            BlinkGap: {
              deps: ['pollUntil'],
              exports: 'BMP.BlinkGap'
            }
          },
          wrap: {
            startFile: [
              'src/frag/00-config.js'
            ],
            endFile: [
              // 'src/frag/99-end.js'
            ]
          }
        }
      },
      options: {
        uglify: {
          max_line_length: 80
        },
        uglify2: {
          output: {
            max_line_len: 80
          },
          warnings: false
        }
      }
    },

    copy: {
      main: {
        files: [
          {
            src: 'build/bic.js',
            dest: 'dist/' + now.valueOf() + '/bic.js'
          },
          {
            src: 'src/buildFiles/files/*',
            dest: 'dist/' + now.valueOf() + '/',
            filter: 'isFile',
            expand: true,
            flatten: true
          }
        ]
      },
      dev: {
        files: [
          {
            src: 'build/bic.js',
            dest: 'tests/support/bic.js'
          }
        ]
      }
    },

    uglify: {
      bic: uglifyConfig,
      options: {
        sourceMap: true,
        sourceMapIncludeSources: true,
        preserveComments: 'some',
        beautify: {
          ascii_only: true,
          max_line_len: 80
        },
        compress: {
          properties: false
        }
      }
    },

    mustache_render: {
      versions: {
        files: [
          {
            template: 'src/buildFiles/templates/versions.json',
            dest: 'dist/' + now.valueOf() + '/versions.json',
            data: {
              timestamp: now.valueOf(),
              datestamp: now.toISOString(),
              version: version
            }
          },
          {
            template: 'src/buildFiles/templates/appcache.mustache',
            dest: 'dist/' + now.valueOf() + '/appcache.mustache',
            data: {
              forms: forms
            }
          }
        ]
      }
    },

    replace: {
      bicVersion: {
        src: [
          'src/bic.js'
        ],
        overwrite: true,
        replacements: [
          {
            from: /window\.BMP\.BIC\.version = '.+?'/,
            to: 'window.BMP.BIC.version = \'' + version + '\''
          }
        ]
      },
      formsVersion: {
        src: [
          'src/frag/00-config.js'
        ],
        overwrite: true,
        replacements: [
          {
            from: /blink\/forms\/3\/.*\/forms3jqm\.min/,
            to: 'blink/forms/3/' + forms + '/forms3jqm.min'
          }
        ]
      }
    }

  });

  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-eslint');
  grunt.loadNpmTasks('grunt-contrib-requirejs');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-concurrent');
  grunt.loadNpmTasks('grunt-karma');
  grunt.loadNpmTasks('grunt-hapi');
  grunt.loadNpmTasks('grunt-mustache-render');
  grunt.loadNpmTasks('grunt-text-replace');

  grunt.registerTask('test', ['build', 'eslint', 'hapi:test', 'karma:phantom']);

  grunt.registerTask('build', ['replace', 'requirejs', 'copy:main', 'copy:dev', 'uglify', 'mustache_render']);
  grunt.registerTask('develop', ['concurrent']);
  grunt.registerTask('default', ['test']);

};
