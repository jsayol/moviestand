'use strict'

// Declare app level module which depends on views, and components
var moviesApp = angular.module('myApp', [
  // 'ngRoute',
  'ui.router',
  'headerControllers',
  'navbarControllers',
  'moviesControllers',
  'moviesServices'
])

moviesApp.run(['$rootScope', '$state', '$stateParams',
  function ($rootScope,   $state,   $stateParams) {
    // It's very handy to add references to $state and $stateParams to the $rootScope
    // so that you can access them from any scope within your applications.For example,
    // <li ng-class="{ active: $state.includes('contacts.list') }"> will set the <li>
    // to active whenever 'contacts.list' or one of its decendents is active.
    $rootScope.$state = $state;
    $rootScope.$stateParams = $stateParams;
  }
])

moviesApp.config(['$stateProvider', '$urlRouterProvider',
  function($stateProvider, $urlRouterProvider) {
    // Use $stateProvider to configure your states.
    $stateProvider
      .state('collection', {
        url: '/collection/:id',
        templateUrl: 'src/list/view.html',
        controller: 'MovieListCtrl'
      })
      .state('collection.movie', {
        url: '/movie/:movieHash',
        views: {
          '@' : {
            templateUrl: 'src/details/view.html',
            controller: 'MovieDetailCtrl'
          }
        }
      })
      .state('settings', {
        url: '/settings',
        templateUrl: 'src/settings/views/menu.html',
        controller: 'SettingsCtrl',
        params: {
          defaultChild: 'settings.collections'
        }
      })
      .state('settings.general', {
        url: '/settings',
        templateUrl: 'src/settings/views/settings.html',
        controller: 'SettingsSettingsCtrl'
      })
      .state('settings.collections', {
        url: '/collections',
        templateUrl: 'src/settings/views/collections.html',
        controller: 'SettingsCollectionsCtrl'
      })
      .state('settings.themes', {
        url: '/themes',
        templateUrl: 'src/settings/views/themes.html',
        controller: 'SettingsThemesCtrl'
      })
      .state('settings.about', {
        url: '/about',
        templateUrl: 'src/settings/views/about.html',
        controller: 'SettingsAboutCtrl'
      })
      .state('settings.collections.details', {
        url: '/:id',
        templateUrl: 'src/settings/views/collectiondetails.html',
        controller: 'SettingsCollectionDetailsCtrl'
      })

      // Use $urlRouterProvider to configure any redirects (when) and invalid urls (otherwise).
      $urlRouterProvider
        .otherwise('/collection/')
        // .otherwise('/settings')

  }
])

var moviesControllers = angular.module('moviesControllers', [])

// We already have a limitTo filter built-in to angular,
// Let's make a startFrom filter
moviesApp.filter('startFrom', function() {
    return function(input, start) {
        start = +start; //parse to int
        return input.slice(start);
    }
})

// If a user drops a file on the app's window, that file will replace
// the whole app. Prevent that behaviour.
document.addEventListener('dragover', function(e){
  e.preventDefault();
  e.stopPropagation();
}, false);
document.addEventListener('drop', function(e){
  e.preventDefault();
  e.stopPropagation();
}, false);
