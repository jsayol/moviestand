'use strict'

// Declare app level module which depends on views, and components
var moviesApp = angular.module('myApp', [
  'ngRoute',
  'headerControllers',
  'moviesControllers',
  'moviesServices'
])

// moviesApp.config(['$routeProvider', function($routeProvider) {
//   $routeProvider.otherwise({redirectTo: '/view1'})
// }])

moviesApp.config(['$routeProvider',
  function($routeProvider) {
    $routeProvider.
      when('/', {
        templateUrl: 'partials/movie-list.html',
        controller: 'MovieListCtrl'
      }).
      when('/movie/:movieId', {
        templateUrl: 'partials/movie-detail.html',
        controller: 'MovieDetailCtrl'
      }).
      otherwise({
        redirectTo: '/'
      })
  }
])
