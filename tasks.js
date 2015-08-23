var os = require('os')
var path = require('path')

var current = {
  platform: os.platform(),
  arch: os.arch()
}

var targets = {
  win32: {
    platform: 'win32',
    arch: 'ia32'
  },
  win64: {
    platform: 'win32',
    arch: 'x64'
  },
  linux32: {
    platform: 'linux',
    arch: 'ia32'
  },
  linux64: {
    platform: 'linux',
    arch: 'x64'
  },
  darwin: {
    platform: 'darwin',
    platformBuild: 'osx',
    arch: 'x64'
  }
}

// Some aliases
targets.win = targets.win32
targets.linux = targets.linux32
targets.darwin64 = targets.darwin
targets.osx = targets.darwin

var app = {
  name: process.env.npm_package_name,
  version: process.env.npm_package_version,
  electron: process.env.npm_package_config_electron,
  ignore: process.env.npm_package_config_ignore,
  dirs: {
    cache: process.env.npm_package_config_dirs_cache,
    build: process.env.npm_package_config_dirs_build,
    dist: process.env.npm_package_config_dirs_dist
  }
}

if (app.ignore === undefined) {
  var envkeys = Object.keys(process.env).filter(function(k) {
    return /^npm_package_config_ignore_/.test(k)
  })
  if (envkeys.length) {
    app.ignore = []
    envkeys.forEach(function(k) {
      app.ignore.push(process.env[k])
    })
  }
}

try {
  switch (process.argv[2]) {
    case 'clean':
      goClean(getTarget(process.argv[3]))
      break
    case 'build':
      goBuild(getTarget(process.argv[3]))
      break
    case 'pack':
      goPack(getTarget(process.argv[3]))
      break
    case 'packtgz':
      goPackTgz(getTarget(process.argv[3]))
      break
    default:
      console.log('Unknown command: '+process.argv[2])
    case 'help':
      showHelp()
  }
}
catch (err) {
  console.error(err)
}

function getTarget(target_name) {
  var target

  if ((target_name === undefined) || (target_name.length == 0)) {
    console.log('No target specified, using current platform as target')
    target = current
  }
  else {
    target = targets[target_name]
  }

  if (!target) {
    throw "Target '" + target_name + "' is not a supported platform."
  }

  return target
}

function goClean(target) {
  var rimraf = require('rimraf')
  var toclean = path.join(app.dirs.build, app.name + '-' + target.platform + '-' + target.arch)

  console.log('Cleaning '+toclean+' ...')
  rimraf.sync(toclean, {disableGlob: true})
}

function goBuild(target) {
  // First of all lets clean any previous buils for this target
  goClean(target)

  // Now lets build
  var packager = require('electron-packager')
  var opts = {
      dir: process.cwd(),
      name: app.name,
      platform: target.platform,
      arch: target.arch,
      version: app.electron,
      out: app.dirs.build,
      cache: app.dirs.cache,
      ignore: app.ignore
      // , asar: true
  }

  packager(opts, function (err, appPath) {
    if (err) {
      console.error(err)
    }
    else {
      console.log('Successfully built in: '+appPath)
    }
  })
}

function goPack(target) {
  var builderOpt = null
  var appPath = path.join(app.dirs.build, app.name + '-' + target.platform + '-' + target.arch)

  if (target.platform == 'win32') {
    builderOpt = {
      appPath: appPath,
      platform: 'win',
      out: app.dirs.dist,
      config: 'packager.json'
    }
  }
  else if (target.platform == 'darwin') {
    if (current.platform == 'linux') {
      throw "Sorry, for now you can't package an OS X application from Linux. Do it from Windows or OS X instead."
    }
    else {
      builderOpt = {
        appPath: path.join(appPath, app.name + '.app'),
        platform: 'osx',
        out: app.dirs.dist,
        config: 'packager.json'
      }
    }
  }

  if (builderOpt) {
    var builder = (require('electron-builder')).init()
    builder.build(builderOpt, function() {})
  }
  else {
    goPackTgz(target)
  }
}

function goPackTgz(target) {
  var fs = require('fs')
  var targz = require('tar.gz')

  var appPath = path.join(app.dirs.build, app.name + '-' + target.platform + '-' + target.arch)
  var filePath = path.join(app.dirs.dist, app.name + '-v' + app.version + '-' + target.platform + '-' + target.arch + '.tar.gz')

  console.log('Packaging app...')

  var read = targz().createReadStream(appPath)
  var write = fs.createWriteStream(filePath).on('finish', function () {
    console.log('Package created: ' + filePath)
  })

  read.pipe(write)
}

function showHelp() {
  console.log('HELP!')
}
