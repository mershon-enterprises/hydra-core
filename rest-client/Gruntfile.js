'use strict';

module.exports = function (grunt) {
  // Load all grunt tasks
  require('load-grunt-tasks')(grunt);
  grunt.loadNpmTasks('grunt-browserify');
  grunt.loadNpmTasks('grunt-string-replace');
  // Show elapsed time at the end.
  require('time-grunt')(grunt);

  // Project configuration.
  grunt.initConfig({
    // Metadata.
    pkg: grunt.file.readJSON('package.json'),
    banner: '/*! <%= pkg.name %> - v<%= pkg.version %> - ' +
      '<%= grunt.template.today("yyyy-mm-dd") %>\n' +
      '<%= pkg.homepage ? "* " + pkg.homepage + "\\n" : "" %>' +
      '* Copyright (c) <%= grunt.template.today("yyyy") %> <%= pkg.author.name %>;' +
      ' Licensed GPLv3 */\n',
    // Task configuration.
    browserify: {
      standalone: {
        src: [ 'src/<%= pkg.name %>.js' ],
        dest: 'dist/<%= pkg.name%>.standalone.js',
        options: {
          bundleOptions: {
            standalone: '<%= pkg.name %>'
          }
        }
      }
    },
    'string-replace': {
      dev: {
        files: {
          'dist/': 'dist/<%= pkg.name%>.standalone.js'
        },
        options: {
          replacements: [
            {
              pattern: 'ENDPOINT_URL',
              replacement: 'http://localhost:3000'
            }
          ]
        }
      },
      dist: {
        files: {
          'dist/': 'dist/<%= pkg.name%>.standalone.js'
        },
        options: {
          replacements: [
            {
              pattern: 'ENDPOINT_URL',
              replacement: 'http://hydra.slixbits.com'
            }
          ]
        }
      }
    },
    clean: {
      dist: ["dist"]
    },
    uglify: {
      options: {
        banner: '<%= banner %>'
      },
      dist: {
        src: '<%= browserify.standalone.dest %>',
        dest: 'dist/<%= pkg.name %>.standalone.min.js'
      },
    },
    nodeunit: {
      files: ['test/**/*_test.js']
    },
    jshint: {
      options: {
        jshintrc: '.jshintrc',
        reporter: require('jshint-stylish')
      },
      gruntfile: {
        src: 'Gruntfile.js'
      },
      lib: {
        options: {
          jshintrc: 'src/.jshintrc'
        },
        src: ['src/**/*.js']
      },
      test: {
        src: ['test/**/*.js']
      },
    },
    watch: {
      gruntfile: {
        files: '<%= jshint.gruntfile.src %>',
        tasks: ['jshint:gruntfile']
      },
      lib: {
        files: '<%= jshint.lib.src %>',
        tasks: ['jshint:lib', 'nodeunit']
      },
      test: {
        files: '<%= jshint.test.src %>',
        tasks: ['jshint:test', 'nodeunit']
      },
    },
  });

  // Default task.
  grunt.registerTask('dev', ['browserify', 'string-replace:dev']);
  grunt.registerTask('dist', ['browserify', 'string-replace:dist', 'uglify:dist']);
  grunt.registerTask('build', ['dist']);
  grunt.registerTask('test', ['nodeunit']);
  grunt.registerTask('default', ['jshint', 'test', 'build']);

};
