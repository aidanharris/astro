module.exports = function(grunt) {
    grunt.initConfig({
        bower_concat: {
            all: {
                dest: './_bower.js',
                cssDest: './_bower.css',
                exclude: [
                ],
                dependencies: {
                },
                bowerOptions: {
                    relative: false
                },
            }
        },
        uglify: {
            my_target: {
                files: {
                    './app/public/js/vender.min.js': ['./_bower.js']
                }
            }
        },
        cssmin: {
            options: {
                shorthandCompacting: false,
                roundingPrecision: -1
            },
            target: {
                files: {
                    './app/public/css/vender.min.css': ['._bower.css'],
                    './app/public/css/core.min.css': ['./public/css/core.css']
                }
            }
        },
        jshint: {
            options: {
                eqeqeq: true
            },
            uses_defaults: ['app.js', 'app/**/*.js']
        }
    });

    grunt.loadNpmTasks('grunt-bower-concat');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-cssmin');
    grunt.loadNpmTasks('grunt-contrib-jshint');

    grunt.registerTask('default', ['bower_concat', 'uglify', 'cssmin']);

};
