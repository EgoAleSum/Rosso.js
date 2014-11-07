var derequire = require('derequire')

module.exports = function(grunt) {
	grunt.initConfig({
		browserify: {
			dist: {
				src: ['src/Rosso.js'],
				dest: 'Rosso.js'
			},
			options: {
				browserifyOptions: {
					standalone: 'Rosso'
				},
				postBundleCB: function(err, src, next) {
					// Run derequire
					var modifiedSrc = false
					
					if(!err) {
						modifiedSrc = derequire(src)
						if(!modifiedSrc) {
							err = true
						}
					}
					
					next(err, modifiedSrc)
				}
			}
		},
		uglify: {
			dist: {
				options: {
					'banner': "/*!\n Rosso.js - minimal client-side JS framework\n (C) 2014 Alessandro Segala.\n Based on page.js, (C) 2012 TJ Holowaychuk <tj@vision-media.ca>.\n License: MIT\n \n Includes path-to-js.\n Copyright (c) 2014 Blake Embrey (hello@blakeembrey.com).\n License: MIT\n */\n"
				},
				files: {
					'Rosso.min.js': ['Rosso.js']
				}
			}
		},
		watch: {
			scripts: {
				files: ['src/*.js'], // Watch all .js files inside src/
				tasks: ['browserify'],
				options: {
					nospawn: true
				}
			}
		}
	})

	grunt.loadNpmTasks('grunt-browserify')
	grunt.loadNpmTasks('grunt-contrib-uglify')
	grunt.loadNpmTasks('grunt-contrib-watch')

	grunt.registerTask('default', ['browserify', 'uglify'])
}
