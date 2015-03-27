var headerControllers = angular.module('headerControllers', []);

headerControllers.controller('HeaderCtrl', ['$scope', 'MoviesView',
  function($scope, MoviesView) {
    var gui = require('nw.gui');
    var win = gui.Window.get();

    $scope.isMaximized = false;
    $scope.view = MoviesView;

    win.on('maximize', function() {
      $scope.isMaximized = true;
    });

    win.on('unmaximize', function() {
      $scope.isMaximized = false;
    });

    $scope.minimize = function() {
      win.minimize();
    }

    $scope.close = function() {
      win.close();
    }

    $scope.maximize = function() {
      if ($scope.isMaximized)
        win.unmaximize();
      else
        win.maximize();
    }

    $scope.showDevTools = function() {
      win.showDevTools()
    }

    $scope.reload = function() {
      win.reloadDev()
    }

    $scope.toggleFullscreen = function() {
      win.toggleFullscreen()
    }

    $scope.historyBack = function() {
      window.history.back()
    }

    $scope.historyFwd = function() {
      window.history.forward()
    }

    $scope.viewGrid = function() {

    }
  }
]);
