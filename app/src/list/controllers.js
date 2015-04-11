'use strict'

/* Controllers */

moviesControllers.controller('MovieListCtrl',
  ['$scope', '$rootScope', '$timeout', '$state', '$stateParams', '_', 'MoviesView', 'SettingsFactory', 'FilterFactory', 'CollectionsFactory',
  function($scope, $rootScope, $timeout, $state, $stateParams, _, MoviesView, SettingsFactory, FilterFactory, CollectionsFactory) {
    $scope.movies = []
    $scope.orderProp = 'filename'
    $scope.view = MoviesView
    $scope.filter = FilterFactory
    $scope.collectionId = $stateParams.id
    $scope.collection = null

    if ($scope.collectionId) {
      $scope.collection = CollectionsFactory.db.find({id: $scope.collectionId})
    }
    else {
      var collections = CollectionsFactory.query()
      if (collections && collections[0]) {
        $state.go('collection', {id: collections[0].id})
      }
      else {
        // It looks like there are no collections.
        // Send the user to the settings page so they can add some
        $state.go('settings.collections')
      }
    }

    if ($scope.collection) {
      CollectionsFactory.getFiles($scope.collection, function(files, init) {
        $('.list-container').css('visibility', 'hidden')
        $scope.movies = files
        if (init) {
          $scope.$apply()
        }

        // console.log('ScrollPos: '+$scope.view.scrollPos[$scope.collectionId])

        if ($scope.view.scrollPos[$scope.collectionId]) {
          $timeout(function() {
            // document.getElementById('view-frame').scrollTop = $scope.view.scrollPos[$scope.collectionId]
            $('.list-container').css('visibility', 'visible')
          }, 0)
        }
        else {
          $('.list-container').css('visibility', 'visible')
        }
      }, function() {
        $scope.$apply()
      })
    }

    // $scope.$on("$destroy", function(){
    //   $scope.view.scrollPos[$scope.collectionId] = document.getElementById('view-frame').scrollTop
    //   console.log('Saved scrollPos: '+$scope.view.scrollPos[$scope.collectionId])
    // });

    $rootScope.$on('$stateChangeStart', function(event, toState, toParams, fromState) {
      if ((fromState.name === 'collection') && $scope.collectionId) {
        $scope.view.scrollPos[$scope.collectionId] = document.getElementById('view-frame').scrollTop
        // console.log('Saved scrollPos: '+$scope.view.scrollPos[$scope.collectionId])
      }
    })

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

    $scope.watched = function(movie) {
      movie.watched = !!! movie.watched
      CollectionsFactory.save()
    }
  }
])
