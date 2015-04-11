var navbarControllers = angular.module('navbarControllers', [])

headerControllers.controller('NavbarCtrl', ['$scope', '$rootScope', '$state', '$location', 'FilterFactory', 'DBFactory', 'CollectionsFactory', 'SettingsFactory', 'MoviesView',
  function($scope, $rootScope, $state, $location, FilterFactory, DBFactory, CollectionsFactory, SettingsFactory, MoviesView) {
    $scope.location = $location
    $scope.$state = $state
    $scope.filter = FilterFactory
    $scope.view = MoviesView
    $scope.settings = SettingsFactory.query()
    $scope.collections = CollectionsFactory.query()
    $scope.currCollection = null
    $scope.currCollectionId = null

    // We add this to monitor changes to these specific filters
    $scope.filterGenre = FilterFactory.genre
    $scope.filterCountry = FilterFactory.country

    var detectCurrCollection = function() {
      var match = $scope.location.path().match(/\/collection\/(.+)/)
      if (match) {
        $scope.currCollectionId = match[1]
        $scope.currCollection = CollectionsFactory.db.find({id: $scope.currCollectionId})
      }
      else {
        $scope.currCollectionId = null
        $scope.currCollection = null
      }
    }

    detectCurrCollection()

    $rootScope.$on('$locationChangeSuccess', detectCurrCollection)

    $rootScope.$on('$stateChangeSuccess', function(event, toState, toParams) {
      if($state.is('settings') && toParams && toParams.defaultChild) {
        $state.go(toParams.defaultChild)
      }
    })

    $scope.countFiles = function(collection) {
      return CollectionsFactory.countFiles(collection || $scope.currCollection)
    }

    $scope.getGenres = function() {
      return CollectionsFactory.getGenres($scope.currCollection)
    }

    $scope.getCountries = function() {
      return CollectionsFactory.getCountries($scope.currCollection)
    }
  }
])
