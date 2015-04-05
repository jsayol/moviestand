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
      if ($scope.view.isMaximized) {
        $scope.view.win.unmaximize()
      }
      else {
        $scope.view.win.maximize()
      }
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
