'use strict';

/* Controllers */

var moviesControllers = angular.module('moviesControllers', []);

moviesControllers.controller('MovieListCtrl',
  ['$scope', 'MoviesLocalDB', 'MoviesView', 'FilesFactory', 'MovieDB', '$location',
  function($scope, MoviesLocalDB, MoviesView, FilesFactory, MovieDB, $location) {
    var gui = require('nw.gui');

    $scope.movies = MoviesLocalDB('movies').value();
    $scope.tmdb = MoviesLocalDB('tmdb');
    $scope.orderProp = 'fileName';
    $scope.view = MoviesView;

    FilesFactory.getFiles(function(files) {
      var newfiles = 0;

      files.forEach(function (f) {
        if (!MoviesLocalDB('movies').find({path: f.path})) {
          newfiles += 1;
          MoviesLocalDB('movies').push(f);
          console.log('New movie detected: '+f.fileName);
        }
      });

      if (newfiles) {
        $scope.movies = MoviesLocalDB('movies').value();
        $scope.$apply();
        MovieDB.update(function() { $scope.$apply(); });
      }
    });

    MovieDB.update(function() { $scope.$apply(); });

    $scope.countries = function(dbinfo) {
      var ctrlist = dbinfo.production_countries.map(
        function (c) {
          return c['name']
        }
      );

      return ctrlist.join(' / ')
    }

    $scope.genres = function(dbinfo) {
      var ctrlist = dbinfo.genres.map(
        function (c) {
          return c['name']
        }
      );

      return ctrlist.join(' / ')
    }

    $scope.play = function(movie) {
      console.log(movie.path);
      gui.Shell.openItem(movie.path);
    }

    $scope.info = function(movie) {
      $location.path('/movie/'+movie.fileName);
    };
  }
]);

moviesControllers.controller('MovieDetailCtrl', ['$scope', '$routeParams', 'MoviesLocalDB',
  function($scope, $routeParams, MoviesLocalDB) {
    $scope.movie = MoviesLocalDB('movies').find({fileName: $routeParams.movieId});
    $scope.movieInfo = MoviesLocalDB('tmdb').find({id: $scope.movie.tmdbid})
  }
]);
