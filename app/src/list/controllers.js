'use strict'

/* Controllers */

moviesControllers.controller('MovieListCtrl',
  ['$scope', '$timeout', '$routeParams', '_', 'MoviesView', 'FilterFactory', 'CollectionsFactory', '$location',
  function($scope, $timeout, $routeParams, _, MoviesView, FilterFactory, CollectionsFactory, $location) {
    $scope.movies = []
    $scope.orderProp = 'filename'
    $scope.view = MoviesView
    $scope.filter = FilterFactory
    $scope.collectionName = $routeParams.collection

    $scope.currentPage = 0
    $scope.pageSize = 10

    if ($scope.collectionName) {
      $scope.collection = CollectionsFactory.db.find({name: $scope.collectionName})
    }
    else {
      var collections = CollectionsFactory.query()
      if (collections && collections[0]) {
        $location.path('/collection/'+collections[0].name)
      }
    }

    if ($scope.collection) {
      CollectionsFactory.getFiles($scope.collection, function(files, init) {
        $('.list-container').css('visibility', 'hidden')
        $scope.movies = files
        if (init) {
          $scope.$apply()
        }

        if ($scope.view.scrollPos[$scope.collectionName]) {
          $timeout(function() {
            document.getElementById('view-frame').scrollTop = $scope.view.scrollPos[$scope.collectionName]
            $('.list-container').css('visibility', 'visible')
          }, 0)
        }
        else {
          $('.list-container').css('visibility', 'visible')
        }
      })
    }

    $scope.$on("$destroy", function(){
      $scope.view.scrollPos[$scope.collectionName] = document.getElementById('view-frame').scrollTop
    });

    $scope.countries = function(movie) {
      return movie.production_countries
        .map(function (c) { return c['name'] })
        .join(' / ')
    }

    $scope.genres = function(movie) {
      return movie.genres
        .map(function (c) { return c['name'] })
        .join(' / ')
    }

    $scope.play = function(movie) {
      console.log(movie.path)
      gui.Shell.openItem(movie.path)
    }

    $scope.info = function(movie) {
      $location.path('/movie/'+movie.filename)
    }
  }
])
