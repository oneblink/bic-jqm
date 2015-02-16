var versions = require('./version.json');
var version = versions.bic;
var forms = versions.forms;
var now = new Date();

var uglifyConfig = {
  files: {}
};
uglifyConfig.files['versions/' + now.valueOf() + '/bic.min.js'] = ['versions/' + now.valueOf() + '/bic.js'];

module.exports = function (grunt) {
  "use strict";
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
          server: require('path').resolve('server/http.js'),
          bases: {},
          noasync: false
        }
      },
      http: {
        options: {
          server: require('path').resolve('server/http.js'),
          bases: {},
          noasync: true
        }
      }//,
      // https: {
      //   options: {
      //     server: require('path').resolve('server/https.js'),
      //     bases: {},
      //     noasync: true
      //   }
      // }
    },

    watch: {
      scripts: {
        files: ['scripts/**', 'tests/**'],
        tasks: ['build-dev', 'eslint', 'mocha:tests']
      },
      build: {
        files: ['buildtests/**'],
        tasks: ['eslint', 'build', 'mocha:build']
      }
    },

    eslint: {
      target: [
          'scripts/**/*.js',
          'tests/**/*.js',
          'buildtests/**/*.js'
      ],
      options: {
        configFile: '.eslintrc'
      }
    },

    mocha: {
      tests: {
        options: {
          urls: [
            'http://localhost:9998/tests/index.html'
          ]
        }
      },
      build: {
        options: {
          urls: [
            'http://localhost:9998/buildtests/index.html'
          ]
        }
      },
      options: {
        bail: true,
        log: true
      }
    },

    clean: ['build'],

    requirejs: {
      outside: {
        options: {
          baseUrl: 'scripts',
          name: 'feature',
          include: ['feature', 'pollUntil', 'BlinkGap'],
          exclude: ['implementations'],
          out: 'build/outside.js',
          optimize: "none",
          paths: {
            feature: '../bower_components/amd-feature/feature',
            pollUntil: '../node_modules/poll-until/poll-until',
            BlinkGap: 'vendor/BMP.BlinkGap'
          },
          shim: {
            BlinkGap: {
              deps: ['pollUntil'],
              exports: 'BMP.BlinkGap'
            }
          }
        }
      },
      compile: {
        options: {
          baseUrl: 'scripts',
          name: '../bower_components/almond/almond',
          include: ['main', 'router', 'auth'],
          out: 'build/bic.js',
          optimize: "none",
          paths: {
            geolocation: '../node_modules/geolocation/geolocation',
            pouchdb: '../bower_components/pouchdb/dist/pouchdb-nightly',
            text: '../bower_components/requirejs-text/text',
            domReady: '../bower_components/requirejs-domready/domReady',
            feature: '../bower_components/amd-feature/feature',
            'es5-shim': 'empty:',
            uuid: '../bower_components/node-uuid/uuid',
            authentication: '../node_modules/offlineLogin/authentication',
            sjcl: '../node_modules/sjcl/sjcl'
          },
          wrap: {
            startFile: [
              'scripts/frag/00-config.js',
              'scripts/frag/05-implementations.js',
              'build/outside.js',
              'scripts/frag/10-start.frag'
            ],
            endFile: 'scripts/frag/99-end.frag'
          }//,
          // wrap: true,
          //insertRequire: ["main"]
        }
      },
      formsdeps: {
        options: {
          baseUrl: "bower_components",
          include: ['picker.date', 'picker.time', 'moment'],
          out: 'versions/' + now.valueOf() + '/formsdeps.min.js',
          paths: {
            jquery: 'empty:',
            "picker": 'pickadate/lib/picker',
            "picker.date": 'pickadate/lib/picker.date',
            "picker.time": 'pickadate/lib/picker.time',
            "moment": 'momentjs/min/moment.min'
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

    'saucelabs-mocha': {
      all: { options: require('./saucelabs') }
    },

    copy: {
      main: {
        files: [
          {
            src: 'build/bic.js',
            dest: 'versions/' + now.valueOf() + '/bic.js'
          },
          {
            src: 'buildFiles/files/*',
            dest: 'versions/' + now.valueOf() + '/',
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
            dest: 'integration/bic.js'
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
          screw_ie8: false,
          properties: false
        },
        mangle: {
          screw_ie8: false
        }
      }
    },

    mustache_render: {
      versions: {
        files : [
          {
            template: 'buildFiles/templates/versions.json',
            dest: 'versions/' + now.valueOf() + '/versions.json',
            data: {
              timestamp: now.valueOf(),
              datestamp: now.toISOString(),
              version: version
            }
          },
          {
            template: 'buildFiles/templates/appcache.mustache',
            dest: 'versions/' + now.valueOf() + '/appcache.mustache',
            data: {
              forms: forms
            }
          },
        ]
      }
    },

    bumpup: {
      files: [
        'package.json',
        'bower.json'
      ],
      setters: {
        version: function (oldValue, releaseType, options, buildMeta) {
          return version;
        }
      }
    },

    replace: {
      bicVersion: {
        src: [
          'scripts/model-application.js'
        ],
        overwrite: true,
        replacements: [
          {
            from: /window\.BMP\.BIC3\.version = '.+?'/,
            to: 'window.BMP.BIC3.version = \'' + version + '\''
          }
        ]
      },
      formsVersion: {
        src: [
          'scripts/frag/00-config.js'
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
  grunt.loadNpmTasks('grunt-mocha');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-requirejs');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-concurrent');
  grunt.loadNpmTasks('grunt-saucelabs');
  grunt.loadNpmTasks('grunt-hapi');
  grunt.loadNpmTasks('grunt-mustache-render');
  grunt.loadNpmTasks('grunt-bumpup');
  grunt.loadNpmTasks('grunt-text-replace');

  grunt.registerTask('test', ['build', 'eslint', 'hapi:test', 'mocha']);
  grunt.registerTask('travis', ['test', 'saucelabs-mocha']);

  grunt.registerTask('build', ['clean', 'replace', 'requirejs', 'copy:main', 'clean', 'uglify', 'mustache_render', 'bumpup']);
  grunt.registerTask('build-dev', ['clean', 'requirejs', 'copy:dev', 'clean']);
  grunt.registerTask('develop', ['concurrent']);
  grunt.registerTask('default', ['test']);

};
