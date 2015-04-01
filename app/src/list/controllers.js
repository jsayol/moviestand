'use strict'

/* Controllers */

moviesControllers.controller('MovieListCtrl',
  ['$scope', 'DBFactory', 'MoviesView', 'FilesFactory', 'TMDBApiFactory', 'FilterFactory', '$location',
  function($scope, DBFactory, MoviesView, FilesFactory, TMDBApiFactory, FilterFactory, $location) {
    $scope.movies = DBFactory.movies.value()
    $scope.orderProp = 'fileName'
    $scope.view = MoviesView
    $scope.filter = FilterFactory

    $scope.currentPage = 0
    $scope.pageSize = 10

    $scope.numberOfPages = function(){
        return Math.ceil($scope.movies.length/$scope.pageSize);
    }

    FilesFactory.getFiles(function(files) {
      console.log('Got '+files.length+' files')
      var db = DBFactory.movies
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

      TMDBApiFactory.checkAll(function() { $scope.$apply() })
    })

    $scope.countries = function(movie) {
      return movie.production_countries
        .map(function (c) { return c['name'] })
        .join(' / ')
    }

    $scope.genres = function(movie) {
      return movie.genres
        .map(function (c) { return c['name'] })
        .join(' / ')
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
