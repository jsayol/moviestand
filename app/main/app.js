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
        templateUrl: 'list/view.html',
        controller: 'MovieListCtrl'
      }).
      when('/movie/:movieId', {
        templateUrl: 'details/view.html',
        controller: 'MovieDetailCtrl'
      }).
      otherwise({
        redirectTo: '/'
      })
  }
])

var moviesControllers = angular.module('moviesControllers', [])
