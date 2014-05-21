/*jslint indent:2, node:true*/
module.exports = function (grunt) {
  "use strict";
  grunt.initConfig({

    concurrent: {
      background: ['connect', 'watch'],
      options: {
        logConcurrentOutput: true
      }
    },

    connect: {
      server: {
        options: {
          port: 9999
        }
      },
      keepalive: {
        options: {
          port: 9999,
          keepalive: true
        }
      }
    },

    watch: {
      source: {
        files: ['scripts/**', 'tests/**'],
        tasks: ['default'],
        options: {
          livereload: true
        }
      }
    },

    jslint: {
      all: {
        src: [
          'scripts/**/*.js',
          '!**/vendor/**/*'
        ],
        directives: {
          "browser": true,
          "es5": true,
          "nomen": true,
          "indent": 2,
          "stupid": true,
          "predef" : [
            "define",
            "require",
            "requirejs",
            "$",
            "_",
            "Backbone",
            "Mustache",
            "Pouch",
            "BlinkForms",
            "jquerymobile",
            "BMP",
            "Modernizr"
          ]
        },
        options: {
          errorsOnly: true
        }
      }
    },

    mocha: {
      all: {
        options: {
          urls: [
            'http://localhost:9999/tests/index.html',
            'http://localhost:9999/tests/build.html'
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
      feature: {
        options: {
          baseUrl: 'scripts',
          name: 'feature',
          out: 'build/feature.js',
          optimize: "none",
          paths: {
            feature: '../bower_components/amd-feature/feature'
          }
        }
      },
      compile: {
        options: {
          baseUrl: 'scripts',
          name: '../bower_components/almond/almond',
          include: ['main', 'router'],
          out: 'build/bic.js',
          optimize: "none",
          paths: {
            pouchdb: '../bower_components/pouchdb/dist/pouchdb-nightly',
            text: '../bower_components/requirejs-text/text',
            domReady: '../bower_components/requirejs-domready/domReady',
            feature: '../bower_components/amd-feature/feature',
            'es5-shim': 'empty:'
          },
          wrap: {
            startFile: [
              'scripts/frag/00-config.js',
              'scripts/frag/05-implementations.js',
              'build/feature.js',
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
          include: ['picker.date', 'picker.time', 'moment', 'rivets'],
          out: 'js/formsdeps.min.js',
          paths: {
            'jquery': 'empty:',
            "picker": 'pickadate/lib/picker',
            "picker.date": 'pickadate/lib/picker.date',
            "picker.time": 'pickadate/lib/picker.time',
            "moment": 'momentjs/min/moment.min',
            "rivets": "rivets/dist/rivets"
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
            dest: 'js/bic.js'
          }
        ]
      }
    },

    uglify: {
      bic: {
        files: {
          'js/bic.min.js': [
            'js/bic.js'
          ]
        }
      },
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
    }

  });

  grunt.loadNpmTasks('grunt-contrib-connect');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-jslint');
  grunt.loadNpmTasks('grunt-mocha');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-requirejs');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-concurrent');
  grunt.loadNpmTasks('grunt-saucelabs');

  grunt.registerTask('test', ['build', 'jslint', 'connect:server', 'mocha']);
  grunt.registerTask('travis', ['test', 'saucelabs-mocha']);

  grunt.registerTask('build', ['clean', 'requirejs', 'copy', 'clean', 'uglify']);
  grunt.registerTask('develop', ['concurrent']);
  grunt.registerTask('default', ['test']);

};
