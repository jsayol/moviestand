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

moviesApp.config(['$routeProvider', '$compileProvider',
  function($routeProvider, $compileProvider) {
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

    // $compileProvider.imgSrcSanitizationWhitelist('app://')
    // $compileProvider.imgSrcSanitizationWhitelist('/^\s/img\//')
  }
])

var moviesControllers = angular.module('moviesControllers', [])

//We already have a limitTo filter built-in to angular,
//let's make a startFrom filter
moviesApp.filter('startFrom', function() {
    return function(input, start) {
        start = +start; //parse to int
        return input.slice(start);
    }
})
