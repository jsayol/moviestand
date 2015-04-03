var navbarControllers = angular.module('navbarControllers', [])

headerControllers.controller('NavbarCtrl', ['$scope', '$rootScope', '$location', 'FilterFactory', 'DBFactory', 'CollectionsFactory', 'MoviesView',
  function($scope, $rootScope, $location, FilterFactory, DBFactory, CollectionsFactory, MoviesView) {
    $scope.location = $location
    $scope.filter = FilterFactory
    $scope.view = MoviesView
    $scope.collections = CollectionsFactory.query()
    $scope.currCollection = null
    $scope.currCollectionName = null

    // We add this to monitor changes to these specific filters
    $scope.filterGenre = FilterFactory.genre
    $scope.filterCountry = FilterFactory.country

    var detectCurrCollection = function() {
      var match = $scope.location.path().match(/\/collection\/(.+)/)
      if (match) {
        $scope.currCollectionName = match[1]
        $scope.currCollection = CollectionsFactory.db.find({name: $scope.currCollectionName})
      }
      else {
        $scope.currCollectionName = null
        $scope.currCollection = null
      }
    }

    detectCurrCollection()

    $rootScope.$on('$locationChangeSuccess', detectCurrCollection)

    $scope.countFiles = function(collection) {
      return CollectionsFactory.countFiles(collection || $scope.currCollection)
    }

    $scope.selected = function(route) {
      return $scope.location.path() === route
    }

    $scope.getGenres = function() {
      return CollectionsFactory.getGenres($scope.currCollection)
      // return []
    }

    $scope.getCountries = function() {
      return CollectionsFactory.getCountries($scope.currCollection)
      // return []
    }
  }
])
