module.exports = function(grunt) {
  "use strict"

  var hostPlatform = {
  	windows: process.platform === 'win32',
  	linux: process.platform === 'linux',
  	osx: process.platform === 'darwin'
  }

  var supportedPlatforms = [
    'win32',
    'win64',
    'linux32',
    'linux64',
    'osx32',
    'osx64'
  ]

  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),

    dirs: {
      build: './build',
      dist: './dist'
    },

    nodewebkit: {
      options: {
        version: '0.12.0',
        buildDir: '<%= dirs.build %>',
        // platforms: ['win64']
        platforms: ['linux32', 'linux64', 'win32', 'win64', 'osx32', 'osx64'] // These are the platforms that we want to build
      },
      src: [
        // Include
        './src/**',
        './node_modules/**',
        './package.json',
        './README.md',
        './LICENSE',

        // Exclude
        '!./node_modules/bower/**',
        '!./node_modules/*grunt*/**',
        '!./node_modules/lowdb/tmp/**',
        '!./node_modules/**/History.md',
        '!./node_modules/**/.npmignore',
        '!./**/bin/**',
        '!./**/test*/**',
        '!./**/benchmark*/**',
        '!./**/doc*/**',
        '!./**/example*/**',
        '!./**/demo*/**',
        '!./**/.*/**'
      ]
    },

    clean: {
			builds: ['<%= dirs.build %>/<%= pkg.name %>/**'],
      dist: ['<%= dirs.dist %>/windows/*.exe', '<%= dirs.dist %>/osx/*.dmg']
		},

		shell: {
			setexecutable: {
				command: function () {
					if (hostPlatform.linux || hostPlatform.osx) {
            return [
              'chmod +x <%= dirs.build %>/<%= pkg.name %>/linux*/<%= pkg.name %> || true',
              'chmod -R +x <%= dirs.build %>/<%= pkg.name %>/osx*/<%= pkg.name %>.app || true'
            ].join(' && ')
          }
          else {
            // There's no need for this in Windows
						return 'echo ""'
					}
				}
			},
			package: {
				command: function (platform) {
          if (supportedPlatforms.indexOf(platform) > -1) {
            if (hostPlatform.linux || hostPlatform.osx) {
              var fileName = '<%= pkg.name %>-<%= pkg.version %>-'+platform+'.tar.gz'
              var platformOpt = (platform.substr(0, 3) == 'osx' ? '*' : '--xform=\'s,^\\.,<%= pkg.name %>,\' .')
  						return [
  							'cd <%= dirs.build %>/<%= pkg.name %>/'+platform,
  							'tar --exclude-vcs -czf "../'+fileName+'" '+platformOpt,
  							'echo "'+platform+' packaged sucessfully" || echo "'+platform+' failed to package"'
  						].join(' && ')
  					} else {
  						return [
  							'grunt compress:'+platform,
  							'( echo "Compressed sucessfully" ) || ( echo "Failed to compress" )'
  						].join(' && ')
  					}
          }
          else {
            return 'echo "'+platform+' failed to package: platform not supported"'
          }
				}
			},
		}

  })

  // If we're in Windows we can't assume that "tar" is available.
  // In those cases we use grunt-compress instead (called from "package" task)
  supportedPlatforms.forEach(function (platform) {
    grunt.config.set('compress.'+platform, {
      options: {
				mode: 'tgz',
				archive: '<%= dirs.build %>/<%= pkg.name %>/<%= pkg.name %>-<%= pkg.version %>-'+platform+'.tar.gz'
			},
			expand: true,
			cwd: '<%= dirs.build %>/<%= pkg.name %>/'+platform,
			src: '**',
			dest: (platform.substr(0, 3) == 'osx' ? '' : '<%= pkg.name %>')
		})
  })

  // load all grunt tasks matching the ['grunt-*', '@*/grunt-*'] patterns
  require('load-grunt-tasks')(grunt)

  // build task
  grunt.registerTask('build', [
    'bower_clean',
    'nodewebkit',
		'shell:setexecutable'
  ])

  // dist task
	grunt.registerTask('dist', [
		'clean:builds',
		'build',
    // 'exec:createDmg',
		// 'exec:createWinInstall',
    'package'
	])

  // Default task(s).
  grunt.registerTask('default', [
    'build',
  ])

}
