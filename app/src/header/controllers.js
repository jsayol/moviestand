var headerControllers = angular.module('headerControllers', [])

headerControllers.controller('HeaderCtrl', ['$scope', 'MoviesView',
  function($scope, MoviesView) {
    $scope.view = MoviesView

    $scope.view.win.on('maximize', function() {
      $scope.view.isMaximized = true
    })

    $scope.view.win.on('unmaximize', function() {
      $scope.view.isMaximized = false
    })

    $scope.minimize = function() {
      $scope.view.win.minimize()
    }

    $scope.close = function() {
      $scope.view.win.close()
    }

    $scope.maximize = function() {
      if ($scope.view.isMaximized)
        $scope.view.win.unmaximize()
      else
        $scope.view.win.maximize()
    }

    $scope.showDevTools = function() {
      $scope.view.win.showDevTools()
    }

    $scope.reload = function() {
      $scope.view.win.reloadDev()
    }

    $scope.historyBack = function() {
      window.history.back()
    }

    $scope.historyFwd = function() {
      window.history.forward()
    }
  }
])

headerControllers.controller('NavbarCtrl', ['$scope', '$location', 'FilterFactory', 'DBFactory', 'MoviesView',
  function($scope, $location, FilterFactory, DBFactory, MoviesView) {
    $scope.location = $location
    $scope.filter = FilterFactory
    $scope.view = MoviesView

    // We add this to monitor changes to these specific filters
    $scope.filterGenre = FilterFactory.genre
    $scope.filterCountry = FilterFactory.country

    $scope.selected = function(route) {
      return $scope.location.path() == route
    }

    $scope.countBy = function(what, key, id) {
      return DBFactory.movies
        .chain()
        .pluck(what)
        .flatten()
        .compact()
        .filter(function(e){ return id==e[key] })
        .value()
        .length
    }

    $scope.countByGenre = function(id) {
      return $scope.countBy('genres', 'id', id)
    }

    $scope.countByCountry = function(id) {
      return $scope.countBy('production_countries', 'iso_3166_1', id)
    }
  }
])
