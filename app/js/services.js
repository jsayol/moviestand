'use strict';

/* Services */

var moviesServices = angular.module('moviesServices', []);

moviesServices.factory('MoviesLocalDB', [
  function() {
    var low = require('lowdb');
    var lowdb = low('db.json');

    // return {
    //   'getDB': function(db) { return lowdb(db); },
    //
    // }

    return lowdb;
  }
]);

moviesServices.factory('MoviesView', [
  function() {
    var view = {mode: 'list'};
    return view;
  }
]);

moviesServices.factory('MovieDB', ['MoviesLocalDB',
  function(MoviesLocalDB) {

    return {
      api: require('moviedb')('306b27f6d4bfe68442cd66152d01a134'),

      getID: function(movie, callback) {
        var match = movie.fileName.match(/^(.+) \(((19|20)[0-9][0-9])\)\.([a-zA-Z0-9_]+)$/);
        if (match) {
          this.api.searchMovie({query: match[1], year:match[2]}, function(err, res) {
            if (err) {
              movie.tmdbid = 'ERR_APIERROR';
              callback(err, movie);
            }
            else if (res && res.total_results) {
              movie.tmdbid = res.results[0].id;
              callback(null, movie);
            }
            else {
              movie.tmdbid = 'ERR_NOTFOUND';
              callback('ERR_NOTFOUND', movie);
            }
          })
        }
        else {
          movie.tmdbid = 'ERR_FILENAME';
          callback('ERR_FILENAME', movie);
        }
      },

      updateInfo: function(movie, callback) {
        // MoviesLocalDB
        this.api.movieInfo({id: movie.tmdbid}, function(err, res){
          if (err) {
            callback('ERR_APIERROR', movie);
          }
          else if (res) {
            var tmdb = MoviesLocalDB('tmdb');
            tmdb.remove({id: res.id});
            tmdb.push(res);
            callback(null, movie);
          }
          else {
            movie.tmdbid = 'ERR_NOTFOUND';
            callback('ERR_NOTFOUND', movie);
          }
        });
      },

      update: function(callback) {
        var that = this;
        MoviesLocalDB('movies').forEach(function(movie) {
          if (movie.tmdbid) {
            if ((typeof(movie.tmdbid) == 'string') && (movie.tmdbid.substr(0,4) == 'ERR_')) {
              // nothing to do here
              console.log('Movie "'+movie.fileName+'" had a previous error('+movie.tmdbid+').')
            }
            else if (!MoviesLocalDB('tmdb').find({id: movie.tmdbid})) {
              console.log('Movie "'+movie.fileName+'" has id('+movie.tmdbid+') but no info. Requesting...')
              that.updateInfo(movie, function(err, m) {
                if (err) {
                  console.log('Movie "'+movie.fileName+'" with id('+movie.tmdbid+') error getting info.')
                  console.log(err);
                }
                callback();
              });
            }
          }
          else {
            console.log('Movie "'+movie.fileName+'" has no id. Requesting...')
            that.getID(movie, function(err, m) {
              if (err) {
                console.log('Movie "'+movie.fileName+'" error getting id.')
                console.log(err);
              }
              else {
                console.log('Movie "'+m.fileName+'" got id('+m.tmdbid+'). Requesting info...')
                that.updateInfo(m, function(err2, m2) {
                  if (err2) {
                    console.log('Movie "'+m2.fileName+'" with id('+m2.tmdbid+') error getting info.')
                    console.log(err2);
                  }
                  else {
                    console.log('Movie "'+m2.fileName+'" with id('+m2.tmdbid+') got info.')
                  }
                  callback();
                });
              }
            });
          }
        });
      }
    };
  }
]);

moviesServices.factory('FilesFactory', [
  function() {
    var fs = require('fs');
    var path = require('path');

    var _FOLDER = '/media/josep/Data/Videos/';
    var _VALID_EXT = ['.mp4', '.mkv', '.avi'];
    var _RECURSIVE = true;

    var walk = function(dir, validExt, recursive, done) {
      var results = [];
      fs.readdir(dir, function(err, list) {
        if (err) return done(err);
        var pending = list.length;
        if (!pending) return done(null, results);
        list.forEach(function(file) {
          file = path.resolve(dir, file);
          fs.stat(file, function(err, stat) {
            if (stat) {

              if (recursive && stat.isDirectory()) {
                walk(file, validExt, true, function(err, res) {
                  results = results.concat(res);
                  if (!--pending) done(null, results);
                });
              } else {
                if (stat.isFile()) {
                  var isvalid = validExt
                    .map(function(e) { return file.slice(-1 * e.length).toUpperCase() == e.toUpperCase();})
                    .reduce(function(p,c) { return p||c}, false);
                  if (isvalid) {
                    results.push(file);
                  }
                }
                if (!--pending) done(null, results);
              }
            }

          });
        });
      });
    };

    return {
      getFiles: function(callback) {
        walk(_FOLDER, _VALID_EXT, _RECURSIVE, function(err, results) {
          if (err) throw err;
          var files = results.map(function(f) {
            return {
              'path': f,
              'fileName': path.basename(f)
            }
          });
          callback(files);
        });
      }
    };
  }
]);
