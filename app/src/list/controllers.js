'use strict'

/* Controllers */

moviesControllers.controller('MovieListCtrl',
  ['$scope', '$timeout', '$state', '$stateParams', '_', 'MoviesView', 'FilterFactory', 'CollectionsFactory',
  function($scope, $timeout, $state, $stateParams, _, MoviesView, FilterFactory, CollectionsFactory) {
    $scope.movies = []
    $scope.orderProp = 'filename'
    $scope.view = MoviesView
    $scope.filter = FilterFactory
    $scope.collectionId = $stateParams.id

    $scope.currentPage = 0
    $scope.pageSize = 10

    if ($scope.collectionId) {
      $scope.collection = CollectionsFactory.db.find({id: $scope.collectionId})
    }
    else {
      var collections = CollectionsFactory.query()
      if (collections && collections[0]) {
        $state.go('collection', {id: collections[0].id})
      }
    }

    if ($scope.collection) {
      CollectionsFactory.getFiles($scope.collection, function(files, init) {
        // $('.list-container').css('visibility', 'hidden')
        $scope.movies = files
        if (init) {
          $scope.$apply()
        }

        // if ($scope.view.scrollPos[$scope.collectionId]) {
        //   $timeout(function() {
        //     document.getElementById('view-frame').scrollTop = $scope.view.scrollPos[$scope.collectionId]
        //     $('.list-container').css('visibility', 'visible')
        //   }, 0)
        // }
        // else {
        //   $('.list-container').css('visibility', 'visible')
        // }
      }, function() {
        $scope.$apply()
      })
    }

    // $scope.$on("$destroy", function(){
    //   $scope.view.scrollPos[$scope.collectionId] = document.getElementById('view-frame').scrollTop
    // });

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
      $scope.view.gui.Shell.openItem(movie.path)
    }

    $scope.info = function(movie) {
      $state.go('movie', {movieHash: movie.filename})
    }
  }
])
