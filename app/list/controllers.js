'use strict'

/* Controllers */

moviesControllers.controller('MovieListCtrl',
  ['$scope', 'MoviesLocalDB', 'MoviesView', 'FilesFactory',
  function($scope, MoviesLocalDB, MoviesView, FilesFactory) {
    $scope.movies = MoviesLocalDB('movies').value()
    $scope.orderProp = 'fileName'
    $scope.view = MoviesView

    $scope.currentPage = 0
    $scope.pageSize = 10

    $scope.numberOfPages=function(){
        return Math.ceil($scope.movies.length/$scope.pageSize);
    }

    FilesFactory.getFiles(function(files) {
      console.log('Got '+files.length+' files')
      var db = MoviesLocalDB('movies')
      var current = db.pluck('path');
      files.forEach(function (f) {
        var pos = $.inArray(f.path, current)
        if (pos < 0) {
          db.push(f)
          console.log('New movie detected: '+f.fileName)
        }
        else {
          delete current[pos]
        }
      })
      console.log('Finished processing files')
      $scope.$apply()
    })
  }
])


moviesControllers.controller('MovieListItemCtrl',
  ['$scope', 'MoviesLocalDB', 'MovieDB', '$location',
  function($scope, MoviesLocalDB, MovieDB, $location) {
    var gui = require('nw.gui')

    $scope.movieInfo = MoviesLocalDB('tmdb').find({id: $scope.movie.tmdbid})

    MovieDB.check($scope.movie, function() {
      $scope.movieInfo = MoviesLocalDB('tmdb').find({id: $scope.movie.tmdbid})
      $scope.$apply()
    })

    $scope.countries = function() {
      var ctrlist = $scope.movieInfo.production_countries.map(
        function (c) {
          return c['name']
        }
      )

      return ctrlist.join(' / ')
    }

    $scope.genres = function() {
      var ctrlist = $scope.movieInfo.genres.map(
        function (c) {
          return c['name']
        }
      )

      return ctrlist.join(' / ')
    }

    $scope.play = function(movie) {
      console.log(movie.path)
      gui.Shell.openItem(movie.path)
    }

    $scope.info = function(movie) {
      $location.path('/movie/'+movie.fileName)
    }
  }
])
