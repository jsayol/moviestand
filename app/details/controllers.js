'use strict'

/* Controllers */

moviesControllers.controller('MovieDetailCtrl', ['$scope', '$routeParams', 'MoviesLocalDB',
  function($scope, $routeParams, MoviesLocalDB) {
    var gui = require('nw.gui')

    $scope.movie = MoviesLocalDB('movies').find({fileName: $routeParams.movieId})
    $scope.movieInfo = MoviesLocalDB('tmdb').find({id: $scope.movie.tmdbid})

    $('.img-loader').on('load', function(e) {
      $(this).remove()
      $('.backdrop')
        .css('background-image', 'url('+this.src+')')
        .addClass('loaded')
    });

    // $('[data-toggle="tooltip"]').tooltip()

    $scope.countries = function() {
      return $scope.movieInfo.production_countries
        .map(function (c) { return c['name'] })
        .join(' / ')
    }

    $scope.genres = function() {
      return $scope.movieInfo.genres
        .map(function (c) { return c['name'] })
        .join(' / ')
    }

    $scope.play = function() {
      gui.Shell.openItem($scope.movie.path)
    }

    $scope.watchtrailer = function(source) {
      if (typeof source == 'undefined')
        source = $scope.movieInfo.trailers.youtube[0].source

      gui.Shell.openExternal('http://www.youtube.com/watch?v='+source)
    }

  }
])
