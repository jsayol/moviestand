'use strict'

/* Services */

var moviesServices = angular.module('moviesServices', [])


moviesServices.factory('LowDBFactory', [
  function() {
    var low = require('lowdb')
    return low
  }
])

moviesServices.factory('MoviesLocalDB', ['LowDBFactory',
  function(LowDBFactory) {
    var lowdb = LowDBFactory('db.json')
    return lowdb

    // return {
    //   'getDB': function(db) { return lowdb(db) },
    //
    // }
  }
])

moviesServices.factory('MoviesView', [
  function() {
    var view = {mode: 'grid'}
    return view
  }
])

moviesServices.factory('MovieDB', ['MoviesLocalDB',
  function(MoviesLocalDB) {
    var api = require('moviedb')('306b27f6d4bfe68442cd66152d01a134')
    var fs = require('fs')
    var async = require('async')

    var queue = async.priorityQueue(function(task, callback) {
      api[task.method](task.args, function() {
        task.callback.apply(this, arguments)
        callback()
      })
    }, 3)

    return {
      makeRequest: function(method, args, priority, callback) {
        queue.push(
          {method:method, args:args, callback:callback},
          priority,
          function() { }
        )
      },

      getID: function(movie, callback) {
        var match = movie.fileName.match(/^(.+) \(((19|20)[0-9][0-9])\)\.([a-zA-Z0-9_]+)$/)
        if (match) {
          var request = {
            query: match[1],
            year: match[2]
          }

          this.makeRequest('searchMovie', request, 20, function(err, res) {
            if (err) {
              movie.tmdbid = 'ERR_APIERROR'
              callback(err, movie)
            }
            else if (res && res.total_results) {
              movie.tmdbid = res.results[0].id
              callback(null, movie)
            }
            else {
              movie.tmdbid = 'ERR_NOTFOUND'
              callback('ERR_NOTFOUND', movie)
            }
          })
        }
        else {
          movie.tmdbid = 'ERR_FILENAME'
          callback('ERR_FILENAME', movie)
        }
      },

      updateInfo: function(movie, callback) {
        var request = {
          id: movie.tmdbid,
          append_to_response: 'trailers'
        }

        this.makeRequest('movieInfo', request, 10, function(err, res){
          if (err) {
            callback('ERR_APIERROR', movie)
          }
          else if (res) {
            var tmdb = MoviesLocalDB('tmdb')
            tmdb.remove({id: res.id})
            tmdb.push(res)
            callback(null, movie)
          }
          else {
            movie.tmdbid = 'ERR_NOTFOUND'
            callback('ERR_NOTFOUND', movie)
          }
        })
      },

      checkUpdateInfo: function(movie, callback) {
        if (!MoviesLocalDB('tmdb').find({id: movie.tmdbid})) {
          console.log('Movie "'+movie.fileName+'" has id('+movie.tmdbid+') but no info. Requesting...')
          this.updateInfo(movie, function(err, m) {
            if (err) {
              console.log('Movie "'+movie.fileName+'" with id('+movie.tmdbid+') error getting info.')
              console.log(err)
            }
            else {
              console.log('Movie "'+movie.fileName+'" with id('+movie.tmdbid+') got info.')
            }
            callback()
          })
        }
      },

      check : function(movie, callback) {
        var self = this

        fs.stat(movie.path, function(err, stats) {
          if (!err && stats && stats.isFile()) {
            if (movie.tmdbid) {
              if ((typeof(movie.tmdbid) == 'string') && (movie.tmdbid.substr(0,4) == 'ERR_')) {
                // nothing to do here
                console.log('Movie "'+movie.fileName+'" had a previous error('+movie.tmdbid+').')
              }
              else {
                self.checkUpdateInfo(movie, callback)
              }
            }
            else {
              console.log('Movie "'+movie.fileName+'" has no id. Requesting...')
              self.getID(movie, function(err, m) {
                if (err) {
                  console.log('Movie "'+movie.fileName+'" error getting id.')
                  console.log(err)
                }
                else {
                  console.log('Movie "'+m.fileName+'" got id('+m.tmdbid+').')
                  callback()
                  self.checkUpdateInfo(m, callback)
                }
              })
            }
          }
          else {
            // TODO: Detect in the folder is not present (might be a removable drive)

            // console.log('Movie "'+movie.path+'" no longer exists. Removing from DB.')
            // MoviesLocalDB('movies').remove({path: movie.path})
            // callback()
          }
        })
      },

      update: function(callback) {
        var self = this

        MoviesLocalDB('movies').forEach(function(movie) {
          fs.stat(movie.path, function(err, stats) {
            if (!err && stats && stats.isFile()) {
              if (movie.tmdbid) {
                if ((typeof(movie.tmdbid) == 'string') && (movie.tmdbid.substr(0,4) == 'ERR_')) {
                  // nothing to do here
                  console.log('Movie "'+movie.fileName+'" had a previous error('+movie.tmdbid+').')
                }
                else {
                  self.checkUpdateInfo(movie, callback)
                }
              }
              else {
                console.log('Movie "'+movie.fileName+'" has no id. Requesting...')
                self.getID(movie, function(err, m) {
                  if (err) {
                    console.log('Movie "'+movie.fileName+'" error getting id.')
                    console.log(err)
                  }
                  else {
                    console.log('Movie "'+m.fileName+'" got id('+m.tmdbid+').')
                    callback()
                    self.checkUpdateInfo(m, callback)
                  }
                })
              }
            }
            else {
              console.log('Movie "'+movie.path+'" no longer exists. Removing from DB.')
              MoviesLocalDB('movies').remove({path: movie.path})
              callback()
            }
          })
        })

      }
    }
  }
])

moviesServices.factory('FilesFactory', [
  function() {
    var fs = require('fs')
    var path = require('path')

    var _FOLDER = '/media/josep/Data/Videos/Movies'
    // var _FOLDER = '/media/josep/SeagateBackup/Videos/Movies'
    var _VALID_EXT = ['.mp4', '.mkv', '.avi']
    var _RECURSIVE = true

    var walk = function(dir, validExt, recursive, done) {
      var results = []
      fs.readdir(dir, function(err, list) {
        if (err) return done(err)
        var pending = list.length
        if (!pending) return done(null, results)
        list.forEach(function(file) {
          file = path.resolve(dir, file)
          fs.stat(file, function(err, stat) {
            if (stat) {

              if (recursive && stat.isDirectory()) {
                walk(file, validExt, true, function(err, res) {
                  results = results.concat(res)
                  if (!--pending) done(null, results)
                })
              } else {
                if (stat.isFile()) {
                  var isvalid = validExt
                    .map(function(e) { return file.slice(-1 * e.length).toUpperCase() == e.toUpperCase()})
                    .reduce(function(p,c) { return p||c}, false)
                  if (isvalid) {
                    results.push(file)
                  }
                }
                if (!--pending) done(null, results)
              }
            }

          })
        })
      })
    }

    return {
      getFiles: function(callback) {
        walk(_FOLDER, _VALID_EXT, _RECURSIVE, function(err, results) {
          if (err) throw err
          var files = results.map(function(f) {
            return {
              'path': f,
              'fileName': path.basename(f)
            }
          })
          callback(files)
        })
      }
    }
  }
])

moviesServices.factory('SettingsFactory', ['LowDBFactory',
  function(LowDBFactory) {
    var path = require('path')

    return {
      conf: LowDBFactory('conf.json'),

      getFolders: function() {
        return this.conf('folders')
      },

      addFolder: function(folder, category, recursive) {
        var f = path.normalize(folder)
        if (!this.conf('folders').find({'path': f})) {
          this.conf('folders').push({
            'path': f,
            'category': type,
            'recursive': recursive
          })
        }
      },

      removeFolder: function(folder) {
        var f = path.normalize(folder)
        this.conf('folders').remove({'path': f})
      },

      getCategories: function() {
        this.conf('folders')
          .chain()
          .pluck('category')
          .uniq()
          .value()
      }

    }

  }
])
