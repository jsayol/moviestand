'use strict'

/* Services */

var moviesServices = angular.module('moviesServices', [])


moviesServices.factory('_', [
  function() {
    var _ = require('lowdb/node_modules/lodash')
    return _
  }
])

moviesServices.factory('MoviesView', [
  function() {
    var obj = {
      mode: 'grid',
      isMaximized: false,
      gui: require('nw.gui'),
      scrollPos: {}
    }

    obj.win = obj.gui.Window.get()

    obj.isFullscreen = obj.win.isFullscreen

    obj.toggleFullscreen = function() { return obj.win.toggleFullscreen() }

    obj.win.on('enter-fullscreen', function() {
      console.log('entering fullscreen');
      obj.isFullscreen = true
      $('body').addClass('fullscreen')
    })
    obj.win.on('leave-fullscreen', function() {
      console.log('leaving fullscreen');
      obj.isFullscreen = false
      $('body').removeClass('fullscreen')
    })

    return obj
  }
])

moviesServices.factory('LowDBFactory', [
  function() {
    var low = require('lowdb')
    return low
  }
])

moviesServices.factory('DBFactory', ['LowDBFactory',
  function(LowDBFactory) {
    var prefix = ''
    // var moviesDB = LowDBFactory(prefix + 'movies.db.json')
    var tmdbDB = LowDBFactory(prefix + 'tmdb.db.json')
    var collectionsDB = LowDBFactory(prefix + 'collections.db.json')

    return {
      collections: collectionsDB('collections'),
      tmdb: tmdbDB('tmdb'),
      tmdbSave: tmdbDB.save,
      collectionsSave: collectionsDB.save
    }
  }
])

moviesServices.factory('CollectionsFactory', ['DBFactory', 'FilesFactory', 'TMDBApiFactory', '_',
  function(DBFactory, FilesFactory, TMDBApiFactory, _) {
    var fs = require('fs')
    var initialized = {}
    var crypto = require('crypto')

    var initFiles = function(collection, cbSave, cbInit, cbUpdate) {
      var folder = collection.folders[0]
      FilesFactory.getFiles(folder, collection.extensions, function(files) {
        console.log('Got '+files.length+' files')

        var crypto = require('crypto')
        var current = _.pluck(folder.files, 'path')
        var newFiles = false

        files.forEach(function (f) {
          var pos = current.indexOf(f.path)
          if (pos < 0) {
            console.log('New movie detected: '+f.path)
            f.hash = crypto.randomBytes(20).toString('hex')
            folder.files.push(f)
            newFiles = true
          }
          else {
            // Speed up subsequent searches in the array
            delete current[pos]
          }
        })

        if (newFiles) {
          cbSave()
        }

        initialized[collection.name] = folder.files
        cbInit(initialized[collection.name], true)

        console.log('Finished processing files')
        // $scope.$apply()

        TMDBApiFactory.checkAll(collection, function() {
          cbSave()
          cbUpdate()
        })
      })
    }

    return {
      db: DBFactory.collections,
      save: DBFactory.collectionsSave,

      query: function(existOnly, callback) {
        var allCollections = DBFactory.collections.value()

        if (existOnly) {
          var pending = allCollections.length
          var list = []

          if (pending > 0) {
            allCollections.forEach(function(col) {
              fs.stat(col.folders[0].path, function(err, stats) {
                if (!err && stats && stats.isDirectory()) {
                  list.push(col)
                }

                if (--pending === 0) {
                  callback(list)
                }
              })
            })
          }
          else {
            callback(list)
          }
        }
        else {
          return allCollections
        }
      },

      getFiles: function(collection, cbInit, cbUpdate) {
        if (initialized[collection.name]) {
          cbInit(initialized[collection.name], false)
        }
        else {
          initFiles(collection, this.save, cbInit, cbUpdate)
        }
      },

      countFiles: function(collection) {
        return _(collection.folders)
          .chain()
          .pluck('files')
          .flatten()
          .value()
          .length
      },

      getGenres: function(collection) {
        // console.log('Getting genres for collection: '+collection)
        var list = _(collection.folders)
          .chain()
          .pluck('files')
          .flatten()
          .pluck('genres')
          .flatten()
          .compact()

        var count = list.countBy('id').value()

        return list
          .uniq('id')
          .clone()
          .forEach(function(g) { g.count = count[g.id] })
          .value()
      },

      getCountries: function(collection) {
        // console.log('Getting countries for collection: '+collection)
        var list = _(collection.folders)
          .chain()
          .pluck('files')
          .flatten()
          .pluck('production_countries')
          .flatten()
          .compact()

        var count = list.countBy('iso_3166_1').value()

        return list
          .uniq('iso_3166_1')
          .clone()
          .forEach(function(g) { g.count = count[g.iso_3166_1] })
          .value()
      },

      sanitation: function(collection) {
        if (typeof collection.id !== 'string') {
          collection.id = crypto.randomBytes(20).toString('hex')
        }

        if (typeof collection.name !== 'string') {
          collection.name = 'Collection'
        }

        if (typeof collection.type !== 'string') {
          collection.type = 'movies'
        }

        if (!Array.isArray(collection.extensions)) {
          collection.extensions = ['']
        }

        if (!Array.isArray(collection.folders)) {
          collection.folders = [{}]
        }

        if (typeof collection.folders[0].path !== 'string') {
          collection.folders[0].path = ''
        }

        if (typeof collection.folders[0].recursive !== 'boolean') {
          collection.folders[0].recursive = false
        }

        if (!Array.isArray(collection.folders[0].files)) {
          collection.folders[0].files = []
        }

        return collection
      },

      createNew: function(collection) {
        if (typeof collection !== 'object') {
          collection = {name : 'New collection'}
        }
        this.db.push(this.sanitation(collection))
        return collection
      },

      removeCollection: function(collection) {
        this.db.remove({id: collection.id})
      }
    }
  }
])
