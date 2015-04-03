moviesServices.factory('TMDBApiFactory', ['DBFactory',
  function(DBFactory) {
    var api = require('moviedb')('306b27f6d4bfe68442cd66152d01a134')
    var fs = require('fs')
    var async = require('async')

    var queue = async.priorityQueue(function(task, callback) {
      api[task.method](task.args, function() {
        task.callback.apply(this, arguments)
        callback()
      })
    }, 3)

    var tmdbIDs = []
    var tmdbByID = {}
    DBFactory.tmdb.forEach(function(t,pos) {
      tmdbIDs.push(t.id)
      tmdbByID[t.id] = t
    })

    return {
      makeRequest: function(method, args, priority, callback) {
        queue.push(
          {method:method, args:args, callback:callback},
          priority,
          function() { }
        )
      },

      getID: function(movie, intermediateSave, callback) {
        var match = movie.filename.match(/^(.+)\s*\(((19|20)[0-9][0-9])\)\.([a-zA-Z0-9_]+)$/)
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
            intermediateSave()
          })
        }
        else {
          movie.tmdbid = 'ERR_FILENAME'
          intermediateSave()
          callback('ERR_FILENAME', movie)
        }
      },

      updateInfo: function(movie, intermediateSave, callback) {
        var request = {
          id: movie.tmdbid,
          append_to_response: 'trailers'
        }

        this.makeRequest('movieInfo', request, 10, function(err, res){
          if (err) {
            callback('ERR_APIERROR', movie, null)
          }
          else if (res) {
            DBFactory.tmdb.remove({id: res.id})
            DBFactory.tmdb.push(res)
            tmdbIDs = DBFactory.tmdb.pluck('id')
            callback(null, movie, res)
          }
          else {
            movie.tmdbid = 'ERR_NOTFOUND'
            intermediateSave()
            callback('ERR_NOTFOUND', movie, null)
          }
        })
      },

      checkUpdateInfo: function(movie, intermediateSave, callback) {
        if (!tmdbByID[movie.tmdbid]) {
          console.log('Movie "'+movie.filename+'" has id('+movie.tmdbid+') but no info. Requesting...')
          this.updateInfo(movie, intermediateSave, function(err, m, info) {
            if (err) {
              console.log('Movie "'+movie.filename+'" with id('+movie.tmdbid+') error getting info.')
              console.log(err)
            }
            else {
              console.log('Movie "'+movie.filename+'" with id('+movie.tmdbid+') got info.')
              movie.title = info.title
              movie.tagline = info.tagline
              movie.overview = info.overview
              movie.poster_path = info.poster_path
              movie.release_date = info.release_date
              movie.genres = info.genres
              movie.runtime = info.runtime
              movie.production_countries = info.production_countries
              intermediateSave()
            }
            callback()
          })
        }
        else if (!movie.title) {
          console.log('Copying info for movie: '+movie.filename)
          var localInfo = tmdbByID[movie.tmdbid]
          movie.title = localInfo.title
          movie.tagline = localInfo.tagline
          movie.overview = localInfo.overview
          movie.poster_path = localInfo.poster_path
          movie.release_date = localInfo.release_date
          movie.genres = localInfo.genres
          movie.runtime = localInfo.runtime
          movie.production_countries = localInfo.production_countries
        }
      },

      check : function(movie, intermediateSave, callback) {
        var self = this

        try {
          var stats = fs.statSync(movie.path)
          if (stats.isFile()) {
            if (movie.tmdbid && (movie.tmdbid === 'ERR_APIERROR')) {
              console.log('Movie "'+movie.filename+'" had a previous error('+movie.tmdbid+'). Retrying...')
              delete movie.tmdbid
            }
            if (movie.tmdbid) {
              if ((typeof(movie.tmdbid) === 'string') && (movie.tmdbid.substr(0,4) === 'ERR_')) {
                console.log('Movie "'+movie.filename+'" had a previous error('+movie.tmdbid+').')
              }
              else {
                self.checkUpdateInfo(movie, intermediateSave, callback)
              }
            }
            else {
              console.log('Movie "'+movie.filename+'" has no id. Requesting...')
              self.getID(movie, intermediateSave, function(err, m) {
                if (err) {
                  console.log('Movie "'+movie.filename+'" error getting id.')
                  console.log(err)
                }
                else {
                  console.log('Movie "'+m.filename+'" got id('+m.tmdbid+').')
                  self.checkUpdateInfo(m, intermediateSave, callback)
                }
              })
            }
          }
          else {
            // TODO: "file" exists but it's not a file. Treat this as if it didn't exist
          }
        }
        catch (e) {
          // TODO: Detect if the folder is not present (might be a removable drive)

          // console.log('Movie "'+movie.path+'" no longer exists. Removing from DB.')
          // DBFactory.movies.remove({path: movie.path})
          // callback()
        }
      },

      checkAll: function(collection, intermediateSave, callback) {
        console.log('Checking all files in the DB...')
        var self = this
        collection.folders[0].files.forEach(function(movie) {
          self.check(movie, intermediateSave, callback)
        })
        intermediateSave()
        callback()
      }
    }
  }
])

moviesServices.factory('FilesFactory', [
  function() {
    var fs = require('fs')
    var path = require('path')

    var walk = function(dir, recursive, validExt, done) {
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
                walk(file, true, validExt, function(err, res) {
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
                if (!--pending) {
                  done(null, results)
                }
              }
            }

          })
        })
      })
    }

    return {
      getFiles: function(folder, extensions, callback) {
        // var folder = collection.folders[0]
        walk(folder.path, folder.recursive, extensions, function(err, results) {
          if (err) {
            throw err
          }
          var files = results.map(function(f) {
            return {
              'path': f,
              'filename': path.basename(f)
            }
          })
          callback(files.sort(function(a,b) { a.filename>b.filename ? 1 : -1 }))
        })
      }
    }
  }
])
