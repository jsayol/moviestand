'use strict'

/* Controllers */

moviesControllers.controller('MovieDetailCtrl', ['$scope', '$routeParams', 'MoviesLocalDB',
  function($scope, $routeParams, MoviesLocalDB) {
    $scope.movie = MoviesLocalDB('movies').find({fileName: $routeParams.movieId})
    $scope.movieInfo = MoviesLocalDB('tmdb').find({id: $scope.movie.tmdbid})
  }
])
