var headerControllers = angular.module('headerControllers', [])

headerControllers.controller('HeaderCtrl', ['$scope', 'MoviesView',
  function($scope, MoviesView) {
    $scope.view = MoviesView

    $scope.minimize = function() {
      $scope.view.win.minimize()
    }

    $scope.close = function() {
      $scope.view.win.close()
    }

    $scope.maximize = function() {
      if ($scope.view.isMaximized) {
        $scope.view.win.unmaximize()
      }
      else {
        $scope.view.win.maximize()
      }
    }

    $scope.toggleDevTools = function() {
      $scope.view.win.toggleDevTools()
    }

    $scope.reload = function() {
      $scope.view.win.reloadIgnoringCache()
    }

    $scope.historyBack = function() {
      window.history.back()
    }

    $scope.historyFwd = function() {
      window.history.forward()
    }
  }
])
